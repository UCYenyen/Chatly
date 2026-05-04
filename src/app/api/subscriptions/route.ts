import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import { createSubscriptionInvoice } from "@/lib/utils/payment-gateway/subscription-service";
import type {
  ApiErrorResponse,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
} from "@/types/subscription.md";
import type { SubscriptionPlan } from "@prisma/client";

const PAID_PLANS: ReadonlyArray<Exclude<SubscriptionPlan, "FREE">> = [
  "PRO",
  "BUSINESS",
];

function isPaidPlanId(
  value: unknown,
): value is Exclude<SubscriptionPlan, "FREE"> {
  return (
    typeof value === "string" &&
    (PAID_PLANS as ReadonlyArray<string>).includes(value)
  );
}

export async function POST(
  request: Request,
): Promise<NextResponse<CreateSubscriptionResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<CreateSubscriptionRequest>;
    if (!isPaidPlanId(body.plan)) {
      return NextResponse.json({ message: "Plan tidak valid" }, { status: 400 });
    }

    const result = await createSubscriptionInvoice(
      { id: session.user.id, email: session.user.email },
      body.plan,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/subscriptions]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
