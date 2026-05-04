import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import { cancelSubscription } from "@/lib/utils/payment-gateway/subscription-service";
import type { ApiErrorResponse } from "@/types/subscription.md";

interface CancelSubscriptionResponse {
  ok: true;
  cancelAtPeriodEnd: boolean;
}

export async function POST(): Promise<
  NextResponse<CancelSubscriptionResponse | ApiErrorResponse>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const updated = await cancelSubscription(session.user.id);
    return NextResponse.json({
      ok: true,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/subscriptions/cancel]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
