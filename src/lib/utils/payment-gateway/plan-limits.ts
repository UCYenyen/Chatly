import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import type {
  BooleanFeatureKey,
  LimitValue,
  NumericLimitKey,
  PlanLimits,
} from "@/types/plan-limits.md";
import type { PlanFeature } from "@/types/subscription.md";

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  PRO: 3,
  ENTERPRISE: 4,
};

export const PLAN_ORDER: ReadonlyArray<SubscriptionPlan> = [
  "FREE",
  "STARTER",
  "GROWTH",
  "PRO",
  "ENTERPRISE",
];

export const DEFAULT_AI_TONE = "professional";

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    channels: 1,
    knowledgeDocuments: 5,
    ignoredContacts: 10,
    customPersonality: false,
    advancedAnalytics: false,
    dataExport: false,
    aiInsight: false,
    apiAccess: false,
    slaSupport: false,
  },
  STARTER: {
    channels: 5,
    knowledgeDocuments: 50,
    ignoredContacts: 50,
    customPersonality: true,
    advancedAnalytics: true,
    dataExport: true,
    aiInsight: false,
    apiAccess: false,
    slaSupport: false,
  },
  GROWTH: {
    channels: 15,
    knowledgeDocuments: 200,
    ignoredContacts: "unlimited",
    customPersonality: true,
    advancedAnalytics: true,
    dataExport: true,
    aiInsight: true,
    apiAccess: true,
    slaSupport: false,
  },
  PRO: {
    channels: "unlimited",
    knowledgeDocuments: "unlimited",
    ignoredContacts: "unlimited",
    customPersonality: true,
    advancedAnalytics: true,
    dataExport: true,
    aiInsight: true,
    apiAccess: true,
    slaSupport: true,
  },
  ENTERPRISE: {
    channels: "unlimited",
    knowledgeDocuments: "unlimited",
    ignoredContacts: "unlimited",
    customPersonality: true,
    advancedAnalytics: true,
    dataExport: true,
    aiInsight: true,
    apiAccess: true,
    slaSupport: true,
  },
};

export function planRank(plan: SubscriptionPlan): number {
  return PLAN_RANK[plan];
}

export function resolveActivePlan(
  plan: SubscriptionPlan | null | undefined,
  status: SubscriptionStatus | null | undefined,
): SubscriptionPlan {
  if (!plan || status !== "ACTIVE") return "FREE";
  return plan;
}

export function highestPlan(plans: ReadonlyArray<SubscriptionPlan>): SubscriptionPlan {
  return plans.reduce<SubscriptionPlan>(
    (best, current) => (planRank(current) > planRank(best) ? current : best),
    "FREE",
  );
}

export function isUnlimited(limit: LimitValue): limit is "unlimited" {
  return limit === "unlimited";
}

export function getNumericLimit(plan: SubscriptionPlan, key: NumericLimitKey): LimitValue {
  return PLAN_LIMITS[plan][key];
}

export function isWithinNumericLimit(
  plan: SubscriptionPlan,
  key: NumericLimitKey,
  currentCount: number,
): boolean {
  const limit = getNumericLimit(plan, key);
  if (isUnlimited(limit)) return true;
  return currentCount < limit;
}

export function hasFeature(plan: SubscriptionPlan, key: BooleanFeatureKey): boolean {
  return PLAN_LIMITS[plan][key] === true;
}

export function minimumPlanForFeature(key: BooleanFeatureKey): SubscriptionPlan | null {
  const found = PLAN_ORDER.find((plan) => hasFeature(plan, key));
  return found ?? null;
}

export function minimumPlanForCount(key: NumericLimitKey, count: number): SubscriptionPlan | null {
  const found = PLAN_ORDER.find((plan) => isWithinNumericLimit(plan, key, count));
  return found ?? null;
}

export function formatLimit(limit: LimitValue): string {
  return isUnlimited(limit) ? "Tak terbatas" : limit.toLocaleString("id-ID");
}

const NUMERIC_FEATURE_LABELS: Record<NumericLimitKey, (value: string) => string> = {
  channels: (value) => `${value} channel WhatsApp`,
  knowledgeDocuments: (value) => `${value} dokumen pelatihan`,
  ignoredContacts: (value) =>
    value === "Tak terbatas"
      ? "Pilih kontak tanpa batas untuk dikecualikan"
      : `Pilih hingga ${value} kontak untuk dikecualikan`,
};

const BOOLEAN_FEATURE_LABELS: Record<BooleanFeatureKey, string> = {
  customPersonality: "Kepribadian AI kustom",
  advancedAnalytics: "Analitik lanjutan (Verified Conversion, Token Usage)",
  dataExport: "Ekspor data CSV",
  aiInsight: "AI Insight & rekomendasi",
  apiAccess: "Akses API & webhook",
  slaSupport: "SLA & dukungan prioritas 24/7",
};

const NUMERIC_FEATURE_ORDER: ReadonlyArray<NumericLimitKey> = [
  "channels",
  "knowledgeDocuments",
  "ignoredContacts",
];

const BOOLEAN_FEATURE_ORDER: ReadonlyArray<BooleanFeatureKey> = [
  "customPersonality",
  "advancedAnalytics",
  "dataExport",
  "aiInsight",
  "apiAccess",
  "slaSupport",
];

export const ALWAYS_INCLUDED_FEATURES: ReadonlyArray<string> = [
  "Auto-reply bot dari dokumen pelatihan",
  "Deteksi niat beli & kirim invoice",
  "Conversion Rate & Intent Dashboard",
  "Handoff AI / Manusia",
];

export function describePlanFeatures(plan: SubscriptionPlan): PlanFeature[] {
  const numeric = NUMERIC_FEATURE_ORDER.map<PlanFeature>((key) => ({
    label: NUMERIC_FEATURE_LABELS[key](formatLimit(getNumericLimit(plan, key))),
    included: true,
  }));

  const boolean = BOOLEAN_FEATURE_ORDER.map<PlanFeature>((key) => ({
    label: BOOLEAN_FEATURE_LABELS[key],
    included: hasFeature(plan, key),
  }));

  return [...numeric, ...boolean];
}

