import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/utils/prisma";
import { sendGowaMessage } from "@/lib/utils/whatsapp";
import { runChatlyAIEngine } from "@/lib/ai-engine";
import { createCustomerTransactionInvoice } from "@/lib/utils/payment-gateway/billing-service";

const WEBHOOK_SECRET = process.env.GOWA_WEBHOOK_SECRET;

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn(
      "[webhook] GOWA_WEBHOOK_SECRET is not set, skipping verification.",
    );
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
    console.error(
      `[webhook] Signature length mismatch. Expected ${a.length}, got ${b.length}`,
    );
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
    is_from_me?: boolean;
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
    (p as any).body ??
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
function extractPhoneFromPayload(
  payload: Record<string, unknown>,
): string | null {
  const user = payload.user as Record<string, unknown> | undefined;
  const candidate =
    (payload.phone as string) ??
    (payload.phone_number as string) ??
    (payload.jid as string) ??
    (user?.id as string) ??
    (user?.phone as string) ??
    null;
  if (typeof candidate !== "string") return null;
  return candidate || null;
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
  // console.log(
  //   "[webhook] Incoming Request Headers:",
  //   JSON.stringify(headersObj, null, 2),
  // );

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

  // DO NOT DELETE
  console.log(body);

  if (!device_id) {
    return NextResponse.json({ ok: true });
  }

  const phoneCandidate = device_id.split("@")[0];

  let whatsappAuth = await prisma.whatsAppAuth.findFirst({
    where: {
      OR: [
        { instanceKey: device_id },
        { phoneNumber: device_id },
        { phoneNumber: phoneCandidate }
      ]
    },
    select: {
      id: true,
      businessId: true,
      status: true,
      phoneNumber: true,
      instanceKey: true,
    },
  });

  if (!whatsappAuth) {
    // Fallback: If we have exactly one authenticated session missing a phone number, assume this webhook belongs to it.
    const missingPhoneAuths = await prisma.whatsAppAuth.findMany({
      where: { status: "AUTHENTICATED", phoneNumber: null },
      select: {
        id: true,
        businessId: true,
        status: true,
        phoneNumber: true,
        instanceKey: true,
      },
    });

    if (missingPhoneAuths.length === 1) {
      whatsappAuth = missingPhoneAuths[0];
      await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: { phoneNumber: (payload as any).device_id },
      });
      whatsappAuth.phoneNumber = device_id;
      console.log(`[webhook] Auto-linked unknown device_id ${device_id} to missing phone auth ${whatsappAuth.id}`);
      console.log(body);
    }
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
      `[whatsapp:${whatsappAuth.businessId}] Connection event="${event}" phone=${phoneNumber}`,
    );
    await prisma.whatsAppAuth.update({
      where: { id: whatsappAuth.id },
      data: {
        status: "AUTHENTICATED",
        phoneNumber: device_id.includes("@") ? device_id : phoneNumber,
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
      `[whatsapp:${whatsappAuth.businessId}] Disconnection event="${event}"`,
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
  // GoWA sends many event types: message, message.ack, message.reaction,
  // message.revoked, message.edited, message.deleted, etc.
  // We only care about exactly "message" — everything else is ignored.
  if (eventLower !== "message") {
    return NextResponse.json({ ok: true });
  }

  // Guard 1: GoWA sets is_from_me / from_me on outgoing messages.
  if (payload.from_me || payload.is_from_me || (payload as any).fromMe) {
    console.log(`[webhook] Ignoring from_me message`);
    return NextResponse.json({ ok: true });
  }

  // Guard 2: If the sender JID matches the device (bot) JID, it's our own message.
  const senderJid = (payload.from ?? "") as string;
  if (senderJid && senderJid === device_id) {
    console.log(`[webhook] Ignoring self-message (sender === device_id)`);
    return NextResponse.json({ ok: true });
  }

  // Filter out group messages (chat_id contains @g.us)
  const chatId = typeof payload.chat_id === "string" ? payload.chat_id : "";
  if (chatId.includes("@g.us")) {
    // console.log(`[webhook] Ignoring group message from chat_id=${chatId}`);
    return NextResponse.json({ ok: true });
  }

  const fromJid = payload.from ?? "";
  const from = normalizePhone(fromJid);
  const text = extractText(payload);

  console.log(
    `[whatsapp:${whatsappAuth.businessId}] from=${from} text=${text}`,
  );

  if (!from || !text) {
    console.log(`[webhook] Early return: empty from or text. from=${from}, text=${text}`);
    return NextResponse.json({ ok: true });
  }

  const messageId =
    typeof payload.id === "string" && payload.id.length > 0 ? payload.id : null;

  // Deduplication: GoWA may retry delivery, and race conditions can cause
  // the same message to arrive multiple times.
  if (messageId) {
    const existing = await prisma.chatLog.findFirst({
      where: { messageId },
      select: { id: true },
    });
    if (existing) {
      console.log(`[webhook] Duplicate message ID detected: ${messageId}`);
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  // To prevent race conditions with GoWA retries, save the USER message FIRST.
  console.log("[webhook] Saving USER chat log...");
  try {
    await prisma.chatLog.create({
      data: {
        businessId: whatsappAuth.businessId,
        phone: from,
        role: "USER",
        content: text,
        messageId: messageId, // If a retry comes right after this, it will be caught by the findUnique above
      },
    });
    console.log("[webhook] USER chat log saved OK");
  } catch (err: any) {
    // If it's a unique constraint violation (P2002), it's a duplicate from a race condition
    if (err.code === "P2002") {
      console.log(`[webhook] Race condition duplicate message ID detected: ${messageId}`);
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("[webhook] Failed to save USER chat log:", err);
  }

  if (!whatsappAuth.instanceKey) {
    console.warn(
      `[whatsapp:${whatsappAuth.businessId}] missing instanceKey, cannot reply`,
    );
    return NextResponse.json({ ok: true });
  }

  try {
    // ── Run AI Engine ──────────────────────────────────────────────────────────
    console.log(`[webhook] >>> Calling runChatlyAIEngine for from=${from} businessId=${whatsappAuth.businessId}`);
    const ai = await runChatlyAIEngine(text, from, whatsappAuth.businessId);
    console.log(`[webhook] <<< AI engine returned. response length=${ai.response?.length}, intents=${JSON.stringify(ai.intent_analytics)}, transaction=${JSON.stringify(ai.generate_transaction)}`);

    let finalReply = ai.response;

    console.log(finalReply);

    // ── Process Intent Analytics ───────────────────────────────────────────────
    // For each intent that is true, create an AnalyticsEvent row
    const trueIntents = Object.entries(ai.intent_analytics)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    console.log(`[webhook] True intents: [${trueIntents.join(", ")}] (${trueIntents.length} total)`);

    if (trueIntents.length > 0) {
      try {
        await prisma.analyticsEvent.createMany({
          data: trueIntents.map((intentName) => ({
            businessId: whatsappAuth.businessId,
            phone: from,
            intentCategory: intentName,
            messageContent: text,
          })),
        });
        console.log(`[webhook] Recorded ${trueIntents.length} intent analytics OK`);
      } catch (analyticsErr) {
        console.error("[webhook] Failed to save analytics events:", analyticsErr);
      }
    }

    // ── Process Transaction Generation ─────────────────────────────────────────
    if (ai.generate_transaction) {
      console.log(`[webhook] Transaction requested: ${JSON.stringify(ai.generate_transaction)}`);
      try {
        const { invoiceUrl } = await createCustomerTransactionInvoice(
          whatsappAuth.businessId,
          from,
          ai.generate_transaction.name,
          ai.generate_transaction.amount,
          ai.generate_transaction.description,
        );

        // Append only the payment link — the AI response already includes the instruction text
        finalReply += `\n\n${invoiceUrl}`;
        console.log(`[webhook] Generated transaction link for ${from}: ${invoiceUrl}`);
      } catch (err) {
        console.error("[webhook] Failed to create customer transaction:", err);
      }
    } else {
      console.log("[webhook] No transaction requested");
    }

    // ── Save AI chat logs & send reply ───────────────────────────────────────
    if (finalReply) {
      console.log(`[webhook] Saving AI chat log (${finalReply.length} chars)...`);
      await prisma.chatLog.create({
        data: {
          businessId: whatsappAuth.businessId,
          phone: from,
          role: "AI",
          content: finalReply,
        },
      });
      console.log("[webhook] AI chat log saved OK");

      console.log(`[webhook] Sending GoWA message to ${from} via instanceKey=${whatsappAuth.instanceKey}...`);
      await sendGowaMessage(from, finalReply, whatsappAuth.instanceKey);
      console.log("[webhook] GoWA message sent OK");
    } else {
      console.log("[webhook] No reply to send (empty response)");
    }
  } catch (err) {
    console.error("[webhook] AI pipeline error:", err);
    console.error("[webhook] Error name:", (err as any)?.name);
    console.error("[webhook] Error message:", (err as any)?.message);
    console.error("[webhook] Error stack:", (err as any)?.stack);
  }

  return NextResponse.json({ ok: true });
}
