import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import { cancelPayment } from "@/lib/utils/payment-gateway/subscription-service";
import type { ApiErrorResponse } from "@/types/subscription.md";

interface CancelPaymentResponse {
  status: "FAILED";
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<CancelPaymentResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await context.params;
    const result = await cancelPayment(session.user.id, id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/payments/:id/cancel]", error);
    const status = message.includes("tidak ditemukan") ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
