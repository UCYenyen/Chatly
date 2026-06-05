import type { SubscriptionPlan } from "@prisma/client";

export type NumericLimitKey =
  | "channels"
  | "knowledgeDocuments"
  | "ignoredContacts";

export type BooleanFeatureKey =
  | "customPersonality"
  | "advancedAnalytics"
  | "dataExport"
  | "aiInsight"
  | "apiAccess"
  | "slaSupport";

export type LimitValue = number | "unlimited";

export interface PlanLimits {
  channels: LimitValue;
  knowledgeDocuments: LimitValue;
  ignoredContacts: LimitValue;
  customPersonality: boolean;
  advancedAnalytics: boolean;
  dataExport: boolean;
  aiInsight: boolean;
  apiAccess: boolean;
  slaSupport: boolean;
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
