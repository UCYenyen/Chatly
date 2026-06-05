import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import prisma from "@/lib/utils/prisma";
import { sendGowaMessage } from "@/lib/utils/whatsapp";
import { runChatlyAIEngine } from "@/lib/ai-engine";
import { getBusinessPlan } from "@/lib/utils/payment-gateway/plan-guard";
import { isPaidPlan } from "@/lib/utils/payment-gateway/plans";
import { createCustomerTransactionInvoice } from "@/lib/utils/payment-gateway/billing-service";
import { canonicalizePhone } from "@/lib/utils/phone";
import { getBusinessHoursStatus } from "@/lib/business-hours";
import {
  notifyHandoverEscalation,
  notifyHandoverReminder,
  notifyHandoverTimeout,
  sendCustomerHandoverAck,
} from "@/lib/utils/handover-notifications";

const WEBHOOK_SECRET = process.env.GOWA_WEBHOOK_SECRET;

const HUMAN_MODE_TIMEOUT_MINUTES = Number(process.env.HUMAN_MODE_TIMEOUT_MINUTES) || 30;
const HUMAN_MODE_TIMEOUT_MS = HUMAN_MODE_TIMEOUT_MINUTES * 60 * 1000;

const HANDOVER_REMINDER_MINUTES = Number(process.env.HANDOVER_REMINDER_MINUTES) || 5;
const HANDOVER_REMINDER_MS = HANDOVER_REMINDER_MINUTES * 60 * 1000;

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.error(
      "[webhook] GOWA_WEBHOOK_SECRET is not set — rejecting all webhook requests.",
    );
    return false;
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
  const body = 'body' in p && typeof p.body === 'string' ? (p.body as string) : undefined;
  return (
    body ??
    p.message?.conversation ??
    p.message?.text ??
    p.message?.extendedTextMessage?.text ??
    p.text ??
    ""
  );
}

function normalizePhone(jid: string): string {
  return canonicalizePhone(jid) ?? (jid.split("@")[0]?.split(":")[0] ?? jid);
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
      const deviceIdForUpdate = typeof payload.device_id === 'string' ? payload.device_id : device_id;
      await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: { phoneNumber: deviceIdForUpdate },
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
  const fromMe = 'fromMe' in payload && typeof payload.fromMe === 'boolean' ? (payload.fromMe as boolean) : false;
  if (payload.from_me || payload.is_from_me || fromMe) {
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

  const activePlan = await getBusinessPlan(whatsappAuth.businessId);
  if (!isPaidPlan(activePlan)) {
    console.log(
      `[webhook] No active paid plan for business ${whatsappAuth.businessId} — staying silent, nothing persisted.`,
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const [business, ignored] = await Promise.all([
      prisma.business.findUnique({
        where: { id: whatsappAuth.businessId },
        select: { ignoreAllContacts: true },
      }),
      prisma.ignoredContact.findUnique({
        where: {
          businessId_phoneNumber: {
            businessId: whatsappAuth.businessId,
            phoneNumber: from,
          },
        },
        select: { id: true },
      }),
    ]);
    if (business?.ignoreAllContacts) {
      console.log(`[webhook] ignoreAllContacts is ON — dropping message from ${from} (no trace).`);
      return NextResponse.json({ ok: true, ignored: true });
    }
    if (ignored) {
      console.log(`[webhook] Ignored contact ${from} — dropping message (no trace).`);
      return NextResponse.json({ ok: true, ignored: true });
    }
  } catch (err) {
    console.error("[webhook] Ignore-list lookup failed (fail-open, continuing):", err);
  }

  const messageId =
    typeof payload.id === "string" && payload.id.length > 0 ? payload.id : null;

  // Atomic deduplication: Rely on unique constraint violation (P2002) instead of
  // separate check. This prevents race conditions where two concurrent webhooks both
  // pass the check before either inserts.
  console.log("[webhook] Saving USER chat log...");
  let userLogSaved = false;
  try {
    await prisma.chatLog.create({
      data: {
        businessId: whatsappAuth.businessId,
        phone: from,
        role: "USER",
        content: text,
        messageId: messageId,
      },
    });
    userLogSaved = true;
    console.log("[webhook] USER chat log saved OK");
  } catch (err: unknown) {
    // If it's a unique constraint violation (P2002), it's a duplicate from a concurrent
    // webhook (GoWA retry or network race condition). Atomically safe.
    const error = err instanceof Error ? err : new Error(String(err));
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : null;
    if (code === "P2002") {
      console.log(`[webhook] Atomic dedup: race condition duplicate messageId=${messageId} (idempotent)`);
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("[webhook] Failed to save USER chat log:", error);
  }

  // Do not invoke the AI engine if the user message was not saved (avoids duplicate responses)
  if (!userLogSaved) {
    return NextResponse.json({ ok: true });
  }

  if (!whatsappAuth.instanceKey) {
    console.warn(
      `[whatsapp:${whatsappAuth.businessId}] missing instanceKey, cannot reply`,
    );
    return NextResponse.json({ ok: true });
  }
  const instanceKey = whatsappAuth.instanceKey;

  // ── Load conversation mode (AI / HUMAN) + business-hours config ────────
  const [convState, businessHoursConfig] = await Promise.all([
    prisma.conversationState.findUnique({
      where: {
        businessId_phone: { businessId: whatsappAuth.businessId, phone: from },
      },
      select: { mode: true, updatedAt: true },
    }),
    prisma.business.findUnique({
      where: { id: whatsappAuth.businessId },
      select: {
        name: true,
        notificationPhone: true,
        handoverHoursEnabled: true,
        timezone: true,
        businessHours: true,
      },
    }),
  ]);
  let currentMode: "AI" | "HUMAN" = convState?.mode === "HUMAN" ? "HUMAN" : "AI";
  console.log(`[webhook] Conversation mode for ${from}: ${currentMode}`);

  const hoursStatus = getBusinessHoursStatus(
    {
      handoverHoursEnabled: businessHoursConfig?.handoverHoursEnabled ?? false,
      timezone: businessHoursConfig?.timezone ?? null,
      businessHours: businessHoursConfig?.businessHours ?? null,
    },
    new Date(),
  );
  console.log(
    `[webhook] Business hours status: ${hoursStatus.isOpen ? "OPEN" : "CLOSED"}${
      hoursStatus.nextOpenLabel ? ` (reopens ${hoursStatus.nextOpenLabel})` : ""
    }`,
  );

  const businessName = businessHoursConfig?.name ?? "";
  const notificationPhone = businessHoursConfig?.notificationPhone ?? null;

  let activeHandover =
    currentMode === "HUMAN"
      ? await prisma.handover.findFirst({
          where: {
            businessId: whatsappAuth.businessId,
            phone: from,
            status: "PENDING",
          },
        })
      : null;

  // ── HUMAN mode is authoritative: bot stays silent until a human resolves it ──
  // The AI engine no longer decides when to resume — control returns to AI only
  // after the handover has been idle for HUMAN_MODE_TIMEOUT_MINUTES.
  if (currentMode === "HUMAN" && convState) {
    if (!hoursStatus.isOpen) {
      await prisma.conversationState.update({
        where: {
          businessId_phone: { businessId: whatsappAuth.businessId, phone: from },
        },
        data: { mode: "AI" },
      });
      currentMode = "AI";
      console.log(
        `[webhook] Business closed — reverting active HUMAN handover for ${from} back to AI.`,
      );

      if (activeHandover) {
        try {
          await prisma.handover.update({
            where: { id: activeHandover.id },
            data: {
              status: "CLOSED",
              resolvedAt: new Date(),
              resolvedBy: "BUSINESS_CLOSED",
            },
          });
        } catch (err) {
          console.error("[handover] Failed to close handover on business-closed revert:", err);
        }
        activeHandover = null;
      }
    }
  }

  if (currentMode === "HUMAN" && convState) {
    const handoverAgeMs = Date.now() - convState.updatedAt.getTime();
    const handoverAgeMinutes = Math.round(handoverAgeMs / 60000);

    if (handoverAgeMs < HUMAN_MODE_TIMEOUT_MS) {
      console.log(
        `[webhook] HUMAN mode active for ${from} (${handoverAgeMinutes}min / ${HUMAN_MODE_TIMEOUT_MINUTES}min). Bot stays silent — admin is handling this conversation.`,
      );

      if (
        activeHandover &&
        !activeHandover.reminderSentAt &&
        Date.now() - activeHandover.escalatedAt.getTime() > HANDOVER_REMINDER_MS
      ) {
        try {
          await prisma.handover.update({
            where: { id: activeHandover.id },
            data: { reminderSentAt: new Date() },
          });
          await notifyHandoverReminder({
            businessName,
            customerPhone: from,
            lastMessage: text,
            instanceKey,
            notificationPhone,
            resolveToken: activeHandover.resolveToken,
          });
          console.log(`[handover] Sent reminder for ${from}`);
        } catch (err) {
          console.error("[handover] Failed to send reminder:", err);
        }
      }

      return NextResponse.json({ ok: true, mode: "HUMAN" });
    }

    await prisma.conversationState.update({
      where: {
        businessId_phone: { businessId: whatsappAuth.businessId, phone: from },
      },
      data: { mode: "AI" },
    });
    currentMode = "AI";
    console.log(
      `[webhook] HUMAN mode for ${from} timed out after ${handoverAgeMinutes}min → reverting to AI.`,
    );

    if (activeHandover) {
      try {
        await prisma.handover.update({
          where: { id: activeHandover.id },
          data: {
            status: "TIMED_OUT",
            resolvedAt: new Date(),
            resolvedBy: "TIMEOUT",
          },
        });
        await notifyHandoverTimeout({
          businessName,
          customerPhone: from,
          lastMessage: text,
          instanceKey,
          notificationPhone,
          resolveToken: activeHandover.resolveToken,
        });
      } catch (err) {
        console.error("[handover] Failed to mark/notify timeout:", err);
      }
      activeHandover = null;
    }
  }

  try {
    // ── Run AI Engine ──────────────────────────────────────────────────────────
    console.log(`[webhook] >>> Calling runChatlyAIEngine for from=${from} businessId=${whatsappAuth.businessId}`);
    const ai = await runChatlyAIEngine(text, from, whatsappAuth.businessId, currentMode, hoursStatus);

    if (!hoursStatus.isOpen && ai.next_mode === "HUMAN") {
      ai.next_mode = "AI";
      ai.escalate_to_human = false;
      console.log(
        `[webhook] Handover blocked for ${from}: business closed. Forcing next_mode=AI.`,
      );
    }
    console.log(`[webhook] <<< AI engine returned. response length=${ai.response?.length}, intents=${JSON.stringify(ai.intent_analytics)}, transaction=${JSON.stringify(ai.generate_transaction)}`);

    let finalReply = ai.response;

    console.log(finalReply);

    // ── Process Intent Analytics & Transaction (atomic) ────────────────────────
    // Group analytics + transaction into a single transaction to prevent orphaned records.
    // If analytics fails, the entire webhook fails gracefully (no duplicate response).
    const trueIntents = Object.entries(ai.intent_analytics)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    console.log(`[webhook] True intents: [${trueIntents.join(", ")}] (${trueIntents.length} total)`);

    // Pre-generate transaction (outside transaction) so we can append invoiceUrl if needed
    let invoiceUrl: string | null = null;
    if (ai.generate_transaction) {
      console.log(`[webhook] Transaction requested: ${JSON.stringify(ai.generate_transaction)}`);
      try {
        const result = await createCustomerTransactionInvoice(
          whatsappAuth.businessId,
          from,
          ai.generate_transaction.name,
          ai.generate_transaction.amount,
          ai.generate_transaction.description,
        );
        invoiceUrl = result.invoiceUrl;
        console.log(`[webhook] Generated transaction link for ${from}: ${invoiceUrl}`);
      } catch (err) {
        console.error("[webhook] Failed to create customer transaction:", err);
        // Continue without transaction — don't fail the entire webhook
      }
    } else {
      console.log("[webhook] No transaction requested");
    }

    // Append invoice URL to reply if available
    if (invoiceUrl) {
      finalReply += `\n\n${invoiceUrl}`;
    }

    // Atomically save analytics events (or no events if none are true)
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
        // Non-blocking: continue even if analytics fails
      }
    }

    // ── Persist next conversation mode ─────────────────────────────────────
    if (ai.next_mode !== currentMode) {
      try {
        await prisma.conversationState.upsert({
          where: {
            businessId_phone: { businessId: whatsappAuth.businessId, phone: from },
          },
          update: { mode: ai.next_mode },
          create: {
            businessId: whatsappAuth.businessId,
            phone: from,
            mode: ai.next_mode,
          },
        });
        console.log(`[webhook] Conversation mode: ${currentMode} → ${ai.next_mode}`);
      } catch (err) {
        console.error("[webhook] Failed to upsert conversation mode:", err);
      }
    }

    if (currentMode === "AI" && ai.next_mode === "HUMAN") {
      try {
        const existingHandover = await prisma.handover.findFirst({
          where: {
            businessId: whatsappAuth.businessId,
            phone: from,
            status: "PENDING",
          },
          select: { id: true },
        });

        if (!existingHandover) {
          const resolveToken = randomBytes(24).toString("hex");
          await prisma.handover.create({
            data: {
              businessId: whatsappAuth.businessId,
              phone: from,
              resolveToken,
            },
          });
          await notifyHandoverEscalation({
            businessName,
            customerPhone: from,
            lastMessage: text,
            instanceKey,
            notificationPhone,
            resolveToken,
          });
          await sendCustomerHandoverAck(from, instanceKey);
          console.log(`[handover] Escalation notified for ${from}`);
        }
      } catch (err) {
        console.error("[handover] Failed to create/notify escalation:", err);
      }
    }

    // ── Save AI chat logs & send reply (only if AI judged it should) ──────
    if (!ai.should_respond) {
      console.log(`[webhook] AI chose silence (mode=${currentMode}, next=${ai.next_mode}). No reply sent.`);
    } else if (finalReply) {
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
      const sendResult = await sendGowaMessage(from, finalReply, whatsappAuth.instanceKey);
      if (sendResult.ok) {
        console.log("[webhook] GoWA message sent OK");
      } else {
        console.error(
          `[webhook] GoWA send FAILED status=${sendResult.status}: ${sendResult.body.slice(0, 300)}`,
        );
      }
    } else {
      console.log("[webhook] No reply to send (empty response)");
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[webhook] AI pipeline error:", error);
    console.error("[webhook] Error name:", error.name);
    console.error("[webhook] Error message:", error.message);
    console.error("[webhook] Error stack:", error.stack);
  }

  return NextResponse.json({ ok: true });
}
