import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import { getSubscriptionState } from "@/lib/utils/payment-gateway/subscription-service";
import type {
  ApiErrorResponse,
  SubscriptionStateResponse,
} from "@/types/subscription.md";

export async function GET(): Promise<
  NextResponse<SubscriptionStateResponse | ApiErrorResponse>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const state = await getSubscriptionState(session.user.id);
  return NextResponse.json(state);
}
