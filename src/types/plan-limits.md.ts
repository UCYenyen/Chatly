import type { SubscriptionPlan } from "@prisma/client";

export type NumericLimitKey =
  | "channels"
  | "knowledgeDocuments"
  | "ignoredContacts"
  | "adminSeats";

export type BooleanFeatureKey =
  | "customPersonality"
  | "advancedAnalytics"
  | "dataExport"
  | "slaSupport"
  | "adminNotification";

export type LimitValue = number | "unlimited";

export interface PlanLimits {
  channels: LimitValue;
  knowledgeDocuments: LimitValue;
  ignoredContacts: LimitValue;
  adminSeats: LimitValue;
  customPersonality: boolean;
  advancedAnalytics: boolean;
  dataExport: boolean;
  slaSupport: boolean;
  adminNotification: boolean;
}

export interface PlanGateResult {
  allowed: boolean;
  plan: SubscriptionPlan;
  requiredPlan: SubscriptionPlan | null;
  limit: LimitValue | boolean;
  reason: string | null;
}

export interface PlanLimitErrorBody {
  message: string;
  code: "PLAN_LIMIT_EXCEEDED";
  feature: NumericLimitKey | BooleanFeatureKey;
  currentPlan: SubscriptionPlan;
  requiredPlan: SubscriptionPlan | null;
}
