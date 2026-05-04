import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import { verifyPaymentByExternalId } from "@/lib/utils/payment-gateway/subscription-service";
import type { ApiErrorResponse } from "@/types/subscription.md";

interface VerifyRequest {
  externalId: string;
}

interface VerifyResponse {
  status: "PAID" | "PENDING" | "EXPIRED" | "FAILED";
}

export async function POST(
  request: Request,
): Promise<NextResponse<VerifyResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<VerifyRequest>;
    if (typeof body.externalId !== "string" || body.externalId.length === 0) {
      return NextResponse.json({ message: "externalId wajib diisi" }, { status: 400 });
    }

    const result = await verifyPaymentByExternalId(session.user.id, body.externalId);
    if (!result) {
      return NextResponse.json({ message: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/subscriptions/verify]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
