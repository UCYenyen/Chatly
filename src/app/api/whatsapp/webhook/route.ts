import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/utils/prisma";
import { sendGowaMessage } from "@/lib/utils/whatsapp";
import { runChatlyAIEngine } from "@/lib/ai-engine";

const WEBHOOK_SECRET = process.env.GOWA_WEBHOOK_SECRET;
const ANALYTICS_COOLDOWN_MS = 5 * 60 * 1000;

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("[webhook] GOWA_WEBHOOK_SECRET is not set, skipping verification.");
    return true;
  }
  if (!signature) {
    console.error("[webhook] No signature header found.");
    return false;
  }

  // Handle 'sha256=' prefix if present
  const signatureHex = signature.replace(/^sha256=/, "");

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHex);

  if (a.length !== b.length) {
    console.error(`[webhook] Signature length mismatch. Expected ${a.length}, got ${b.length}`);
    return false;
  }

  const match = timingSafeEqual(a, b);
  if (!match) {
    console.error("[webhook] Signature mismatch.");
    console.debug("[webhook] Expected hex:", expected);
    console.debug("[webhook] Received hex:", signatureHex);
  }

  return match;
}

interface GowaWebhookPayload {
  event: string;
  device_id: string;
  payload: Record<string, unknown> & {
    from?: string;
    from_me?: boolean;
    message?: {
      text?: string;
      conversation?: string;
      extendedTextMessage?: { text?: string };
    };
    text?: string;
  };
}

function extractText(p: GowaWebhookPayload["payload"]): string {
  return (
    p.message?.conversation ??
    p.message?.text ??
    p.message?.extendedTextMessage?.text ??
    p.text ??
    ""
  );
}

function normalizePhone(jid: string): string {
  return jid.split("@")[0]?.split(":")[0] ?? jid;
}

// Gowa can embed the connected phone in several locations inside the payload.
function extractPhoneFromPayload(payload: Record<string, unknown>): string | null {
  const user = payload.user as Record<string, unknown> | undefined;
  const candidate =
    (payload.phone as string) ??
    (payload.phone_number as string) ??
    (payload.jid as string) ??
    (user?.id as string) ??
    (user?.phone as string) ??
    null;
  if (typeof candidate !== "string") return null;
  const cleaned = candidate.split("@")[0]?.split(":")[0] ?? null;
  return cleaned || null;
}

// Gowa fires several possible event names when a device successfully connects.
const CONNECTION_EVENTS = new Set([
  "connection",
  "connected",
  "login",
  "logged_in",
  "authenticated",
  "open",
  "ready",
]);

// Gowa fires these events when a device disconnects.
const DISCONNECTION_EVENTS = new Set([
  "disconnected",
  "logout",
  "logged_out",
  "close",
]);

export async function GET() {
  return NextResponse.json({
    status: "alive",
    message: "WhatsApp Webhook is ready for POST requests",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  
  // Log all headers for debugging
  const headersObj = Object.fromEntries(request.headers.entries());
  console.log("[webhook] Incoming Request Headers:", JSON.stringify(headersObj, null, 2));

  const signature =
    request.headers.get("x-hub-signature-256") ??
    request.headers.get("x-signature") ??
    request.headers.get("hmac"); // Check alternative header name

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: GowaWebhookPayload;
  try {
    body = JSON.parse(rawBody) as GowaWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, device_id, payload } = body;

  if (!device_id) {
    return NextResponse.json({ ok: true });
  }

  // Select `id` too so we can do targeted updates without relying on instanceKey uniqueness.
  let whatsappAuth = await prisma.whatsAppAuth.findFirst({
    where: { instanceKey: device_id },
    select: { id: true, businessId: true, status: true, phoneNumber: true, instanceKey: true },
  });

  // Fallback: search by phone number if device_id is a phone number
  if (!whatsappAuth && device_id.includes("@")) {
    const phone = device_id.split("@")[0];
    whatsappAuth = await prisma.whatsAppAuth.findFirst({
      where: { phoneNumber: phone },
      select: { id: true, businessId: true, status: true, phoneNumber: true, instanceKey: true },
    });
  }

  if (!whatsappAuth) {
    console.warn(`[webhook] Unknown device_id: ${device_id}. Event: ${event}`);
    console.debug("Payload:", JSON.stringify(payload));
    return NextResponse.json({ ok: true });
  }

  const eventLower = event.toLowerCase();

  // ── Handle connection event ─────────────────────────────────────────────────
  if (CONNECTION_EVENTS.has(eventLower)) {
    const phoneNumber = extractPhoneFromPayload(payload);
    console.log(
      `[whatsapp:${whatsappAuth.businessId}] Connection event="${event}" phone=${phoneNumber}`
    );
    await prisma.whatsAppAuth.update({
      where: { id: whatsappAuth.id },
      data: {
        status: "AUTHENTICATED",
        phoneNumber: phoneNumber,
        qrCode: null,
        qrCodeExpiry: null,
        lastConnected: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Handle disconnection event ──────────────────────────────────────────────
  if (DISCONNECTION_EVENTS.has(eventLower)) {
    console.log(
      `[whatsapp:${whatsappAuth.businessId}] Disconnection event="${event}"`
    );
    await prisma.whatsAppAuth.update({
      where: { id: whatsappAuth.id },
      data: {
        status: "DISCONNECTED",
        disconnectedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Handle incoming message event ──────────────────────────────────────────
  if (eventLower !== "message") {
    // Unknown / unhandled event — acknowledge and ignore.
    return NextResponse.json({ ok: true });
  }

  if (payload.from_me) {
    return NextResponse.json({ ok: true });
  }

  const fromJid = payload.from ?? "";
  const from = normalizePhone(fromJid);
  const text = extractText(payload);

  console.log(
    `[whatsapp:${whatsappAuth.businessId}] from=${from} text=${text}`
  );

  if (!from || !text) {
    return NextResponse.json({ ok: true });
  }

  const messageId =
    typeof payload.id === "string" && payload.id.length > 0
      ? payload.id
      : null;

  if (messageId) {
    const existing = await prisma.chatLog.findUnique({
      where: { messageId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  if (!whatsappAuth.instanceKey) {
    console.warn(
      `[whatsapp:${whatsappAuth.businessId}] missing instanceKey, cannot reply`
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const ai = await runChatlyAIEngine(text, from, whatsappAuth.businessId);

    const cooldownSince = new Date(Date.now() - ANALYTICS_COOLDOWN_MS);
    const recentEvent = await prisma.analyticsEvent.findFirst({
      where: {
        businessId: whatsappAuth.businessId,
        phone: from,
        intentCategory: ai.intentCategory,
        mentionedProduct: ai.mentionedProduct,
        createdAt: { gte: cooldownSince },
      },
      select: { id: true },
    });

    if (!recentEvent) {
      await prisma.analyticsEvent.create({
        data: {
          businessId: whatsappAuth.businessId,
          phone: from,
          intentCategory: ai.intentCategory,
          mentionedProduct: ai.mentionedProduct,
        },
      });
    }

    await prisma.chatLog.create({
      data: {
        businessId: whatsappAuth.businessId,
        phone: from,
        role: "USER",
        content: text,
        messageId: messageId,
      },
    });

    if (ai.reply) {
      await prisma.chatLog.create({
        data: {
          businessId: whatsappAuth.businessId,
          phone: from,
          role: "AI",
          content: ai.reply,
        },
      });

      await sendGowaMessage(from, ai.reply, whatsappAuth.instanceKey);
    }
  } catch (err) {
    console.error("[webhook] AI pipeline error:", err);
  }

  return NextResponse.json({ ok: true });
}
