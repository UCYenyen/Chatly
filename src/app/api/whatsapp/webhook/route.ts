import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/utils/prisma";

const GOWA_API_BASE = process.env.GOWA_API_BASE || "http://localhost:3001";
const GOWA_BASIC_AUTH_USER = process.env.GOWA_BASIC_AUTH_USER;
const GOWA_BASIC_AUTH_PASS = process.env.GOWA_BASIC_AUTH_PASS;
const WEBHOOK_SECRET = process.env.GOWA_WEBHOOK_SECRET;

function gowaAuthHeader(): Record<string, string> {
  if (!GOWA_BASIC_AUTH_USER || !GOWA_BASIC_AUTH_PASS) return {};
  const token = Buffer.from(
    `${GOWA_BASIC_AUTH_USER}:${GOWA_BASIC_AUTH_PASS}`
  ).toString("base64");
  return { Authorization: `Basic ${token}` };
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) return true;
  if (!signature) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.replace(/^sha256=/, ""));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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

async function sendWhatsAppReply(
  deviceId: string,
  to: string,
  message: string
): Promise<void> {
  const res = await fetch(`${GOWA_API_BASE}/send/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Device-Id": deviceId,
      ...gowaAuthHeader(),
    },
    body: JSON.stringify({ phone: to, message }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(
      `Gowa send/message failed (${res.status}):`,
      errText.slice(0, 500)
    );
  }
}

async function generateReply(
  _businessId: string,
  _from: string,
  text: string
): Promise<string | null> {
  if (!text) return null;
  return `Halo! Pesan kamu sudah kami terima: "${text}"`;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-hub-signature-256") ??
    request.headers.get("x-signature");

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
    select: { id: true, businessId: true, status: true, phoneNumber: true },
  });

  // Fallback: search by phone number if device_id is a phone number
  if (!whatsappAuth && device_id.includes("@")) {
    const phone = device_id.split("@")[0];
    whatsappAuth = await prisma.whatsAppAuth.findFirst({
      where: { phoneNumber: phone },
      select: { id: true, businessId: true, status: true, phoneNumber: true },
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

  try {
    const reply = await generateReply(whatsappAuth.businessId, from, text);
    if (reply) {
      await sendWhatsAppReply(device_id, from, reply);
    }
  } catch (err) {
    console.error("Reply pipeline error:", err);
  }

  return NextResponse.json({ ok: true });
}
