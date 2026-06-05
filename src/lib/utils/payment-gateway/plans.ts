import type { PlanDefinition, SubscriptionPlan } from "@/types/subscription.md";
import { describePlanFeatures } from "./plan-limits";

const MONTH_DAYS = 30;
const YEAR_DAYS = 365;

export const PLANS: Record<SubscriptionPlan, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Free",
    description: "Untuk eksplorasi awal Chatly.",
    amount: 0,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: describePlanFeatures("FREE"),
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    description: "Untuk tim kecil yang sedang memulai.",
    amount: 149_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: describePlanFeatures("STARTER"),
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth",
    description: "Untuk tim yang sedang berkembang pesat.",
    amount: 349_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    highlighted: true,
    features: describePlanFeatures("GROWTH"),
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Untuk skala perusahaan dengan kebutuhan advanced.",
    amount: 749_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: describePlanFeatures("PRO"),
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "Solusi custom untuk kebutuhan enterprise skala besar.",
    amount: 0,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: describePlanFeatures("ENTERPRISE"),
  },
};

export const PLANS_YEARLY: Record<SubscriptionPlan, PlanDefinition | null> = {
  FREE: null,
  STARTER: {
    id: "STARTER",
    name: "Starter (Tahunan)",
    description: "Hemat 15% dari harga monthly × 12",
    amount: 1_520_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    features: describePlanFeatures("STARTER"),
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth (Tahunan)",
    description: "Hemat 15% dari harga monthly × 12",
    amount: 3_560_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    highlighted: true,
    features: describePlanFeatures("GROWTH"),
  },
  PRO: {
    id: "PRO",
    name: "Pro (Tahunan)",
    description: "Hemat 15% dari harga monthly × 12",
    amount: 7_640_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    features: describePlanFeatures("PRO"),
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise (Custom)",
    description: "Custom pricing dengan kontrak tahunan",
    amount: 0,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    features: describePlanFeatures("ENTERPRISE"),
  },
};

export function getPlan(plan: SubscriptionPlan, yearly: boolean = false): PlanDefinition {
  if (yearly && plan !== "FREE") {
    const yearlyPlan = PLANS_YEARLY[plan];
    if (yearlyPlan) return yearlyPlan;
  }
  const monthlyPlan = PLANS[plan];
  if (!monthlyPlan) {
    throw new Error(`Invalid plan: ${plan}`);
  }
  return monthlyPlan;
}

export function isPaidPlan(
  plan: SubscriptionPlan,
): plan is Exclude<SubscriptionPlan, "FREE"> {
  return plan !== "FREE";
}
