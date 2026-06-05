import { NextResponse } from "next/server";
import type { SubscriptionPlan } from "@prisma/client";
import prisma from "@/lib/utils/prisma";
import type {
  BooleanFeatureKey,
  NumericLimitKey,
  PlanLimitErrorBody,
} from "@/types/plan-limits.md";
import {
  getNumericLimit,
  hasFeature,
  highestPlan,
  isUnlimited,
  minimumPlanForCount,
  minimumPlanForFeature,
  resolveActivePlan,
} from "./plan-limits";

export class PlanLimitError extends Error {
  readonly body: PlanLimitErrorBody;

  constructor(body: PlanLimitErrorBody) {
    super(body.message);
    this.name = "PlanLimitError";
    this.body = body;
  }
}

export async function getBusinessPlan(businessId: string): Promise<SubscriptionPlan> {
  const subscription = await prisma.subscription.findUnique({
    where: { businessId },
    select: { plan: true, status: true },
  });
  return resolveActivePlan(subscription?.plan, subscription?.status);
}

export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscriptions = await prisma.subscription.findMany({
    where: { business: { userId }, status: "ACTIVE" },
    select: { plan: true },
  });
  return highestPlan(subscriptions.map((s) => s.plan));
}

function planLabel(plan: SubscriptionPlan | null): string {
  if (!plan) return "paket lebih tinggi";
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

export function enforceNumericLimit(
  plan: SubscriptionPlan,
  key: NumericLimitKey,
  existingCount: number,
  featureLabel: string,
  adding: number = 1,
): void {
  const limit = getNumericLimit(plan, key);
  if (isUnlimited(limit)) return;
  if (existingCount + adding <= limit) return;
  const requiredPlan = minimumPlanForCount(key, existingCount + adding - 1);
  throw new PlanLimitError({
    message: `Paket ${planLabel(plan)} hanya mengizinkan ${limit} ${featureLabel}. Upgrade ke ${planLabel(requiredPlan)} untuk menambah lebih banyak.`,
    code: "PLAN_LIMIT_EXCEEDED",
    feature: key,
    currentPlan: plan,
    requiredPlan,
  });
}

export function enforceFeature(
  plan: SubscriptionPlan,
  key: BooleanFeatureKey,
  featureLabel: string,
): void {
  if (hasFeature(plan, key)) return;
  const requiredPlan = minimumPlanForFeature(key);
  throw new PlanLimitError({
    message: `${featureLabel} tersedia mulai paket ${planLabel(requiredPlan)}. Upgrade untuk membuka fitur ini.`,
    code: "PLAN_LIMIT_EXCEEDED",
    feature: key,
    currentPlan: plan,
    requiredPlan,
  });
}

export function planLimitResponse(error: PlanLimitError): NextResponse<PlanLimitErrorBody> {
  return NextResponse.json(error.body, { status: 403 });
}
