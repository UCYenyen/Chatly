"use client";

import type { SubscriptionPlan } from "@prisma/client";
import { useSubscriptionContext } from "@/components/features/subscription/SubscriptionProvider";
import {
  PLAN_LIMITS,
  getNumericLimit,
  hasFeature,
  isWithinNumericLimit,
  minimumPlanForFeature,
  resolveActivePlan,
} from "@/lib/utils/payment-gateway/plan-limits";
import type {
  BooleanFeatureKey,
  LimitValue,
  NumericLimitKey,
  PlanLimits,
} from "@/types/plan-limits.md";

export interface PlanGate {
  plan: SubscriptionPlan;
  limits: PlanLimits;
  isLoading: boolean;
  hasFeature: (key: BooleanFeatureKey) => boolean;
  requiredPlanForFeature: (key: BooleanFeatureKey) => SubscriptionPlan | null;
  numericLimit: (key: NumericLimitKey) => LimitValue;
  canAddMore: (key: NumericLimitKey, currentCount: number) => boolean;
}

export function usePlanGate(): PlanGate {
  const { data, isLoading } = useSubscriptionContext();
  const plan = resolveActivePlan(
    data?.subscription?.plan,
    data?.subscription?.status,
  );

  return {
    plan,
    limits: PLAN_LIMITS[plan],
    isLoading,
    hasFeature: (key) => hasFeature(plan, key),
    requiredPlanForFeature: (key) => minimumPlanForFeature(key),
    numericLimit: (key) => getNumericLimit(plan, key),
    canAddMore: (key, currentCount) => isWithinNumericLimit(plan, key, currentCount),
  };
}
