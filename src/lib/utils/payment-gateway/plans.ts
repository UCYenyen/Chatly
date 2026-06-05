import type { PlanDefinition, SubscriptionPlan } from "@/types/subscription.md";

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
    features: [
      { label: "100 pesan / bulan", included: true },
      { label: "1 channel WhatsApp", included: true },
      { label: "Analitik dasar", included: true },
      { label: "Dukungan email", included: false },
      { label: "SLA Support", included: false },
    ],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    description: "Untuk tim kecil yang sedang memulai.",
    amount: 149_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: [
      { label: "10.000 pesan / bulan", included: true },
      { label: "5 channel terhubung", included: true },
      { label: "Analitik lanjutan", included: true },
      { label: "Dukungan email", included: true },
      { label: "SLA Support", included: false },
    ],
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
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "15 channel terhubung", included: true },
      { label: "Analitik real-time + ekspor", included: true },
      { label: "Dukungan prioritas email", included: true },
      { label: "SLA Support", included: false },
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Untuk skala perusahaan dengan kebutuhan advanced.",
    amount: 749_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "Channel tak terbatas", included: true },
      { label: "Analitik real-time + ekspor advanced", included: true },
      { label: "Dukungan prioritas 24/7", included: true },
      { label: "SLA Support 99.9% uptime", included: true },
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "Solusi custom untuk kebutuhan enterprise skala besar.",
    amount: 2_500_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "Channel tak terbatas", included: true },
      { label: "Analitik custom dashboard", included: true },
      { label: "Dedicated support team", included: true },
      { label: "SLA Support 99.99% uptime", included: true },
    ],
  },
};

export const PLANS_YEARLY: Record<SubscriptionPlan, PlanDefinition | null> = {
  FREE: null,
  STARTER: {
    id: "STARTER",
    name: "Starter (Tahunan)",
    description: "Hemat 15% dengan pembayaran tahunan",
    amount: 1_639_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    features: [
      { label: "10.000 pesan / bulan", included: true },
      { label: "5 channel terhubung", included: true },
      { label: "Analitik lanjutan", included: true },
      { label: "Dukungan email", included: true },
      { label: "SLA Support", included: false },
    ],
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth (Tahunan)",
    description: "Hemat 15% dengan pembayaran tahunan",
    amount: 3_839_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    highlighted: true,
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "15 channel terhubung", included: true },
      { label: "Analitik real-time + ekspor", included: true },
      { label: "Dukungan prioritas email", included: true },
      { label: "SLA Support", included: false },
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro (Tahunan)",
    description: "Hemat 15% dengan pembayaran tahunan",
    amount: 8_239_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "Channel tak terbatas", included: true },
      { label: "Analitik real-time + ekspor advanced", included: true },
      { label: "Dukungan prioritas 24/7", included: true },
      { label: "SLA Support 99.9% uptime", included: true },
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise (Tahunan)",
    description: "Custom pricing dengan kontrak tahunan",
    amount: 27_500_000,
    currency: "IDR",
    interval: "year",
    intervalDays: YEAR_DAYS,
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "Channel tak terbatas", included: true },
      { label: "Analitik custom dashboard", included: true },
      { label: "Dedicated support team", included: true },
      { label: "SLA Support 99.99% uptime", included: true },
    ],
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
