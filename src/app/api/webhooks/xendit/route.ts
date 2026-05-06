import { NextResponse } from "next/server";
import { handleXenditCallback } from "@/lib/utils/payment-gateway/billing-service";
import type {
  ApiErrorResponse,
  XenditInvoiceCallbackPayload,
} from "@/types/subscription.md";

interface WebhookOkResponse {
  ok: true;
}

function isInvoicePayload(value: unknown): value is XenditInvoiceCallbackPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.external_id === "string" &&
    typeof v.status === "string" &&
    typeof v.amount === "number"
  );
}

export async function POST(
  request: Request,
): Promise<NextResponse<WebhookOkResponse | ApiErrorResponse>> {
  const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expectedToken) {
    console.error("[xendit webhook] XENDIT_CALLBACK_TOKEN is not configured");
    return NextResponse.json({ message: "Server salah konfigurasi" }, { status: 500 });
  }

  const callbackToken = request.headers.get("x-callback-token");
  if (callbackToken !== expectedToken) {
    console.warn("[xendit webhook] Invalid callback token received");
    return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Body bukan JSON" }, { status: 400 });
  }

  console.log("[xendit webhook] Received payload:", JSON.stringify(payload, null, 2));

  if (!isInvoicePayload(payload)) {
    console.warn("[xendit webhook] Payload tidak dikenali:", payload);
    return NextResponse.json({ message: "Payload tidak dikenali" }, { status: 400 });
  }

  try {
    console.log(`[xendit webhook] Processing: external_id=${payload.external_id}, status=${payload.status}, amount=${payload.amount}`);
    await handleXenditCallback(payload);
    console.log(`[xendit webhook] Successfully processed: ${payload.external_id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[xendit webhook]", error);
    const message = error instanceof Error ? error.message : "Gagal memproses callback";
    return NextResponse.json({ message }, { status: 500 });
  }
}

