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

  const whatsappAuth = await prisma.whatsAppAuth.findFirst({
    where: { instanceKey: device_id },
    select: { businessId: true },
  });

  if (!whatsappAuth) {
    console.warn("Webhook for unknown device:", device_id);
    return NextResponse.json({ ok: true });
  }

  if (event !== "message") {
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
