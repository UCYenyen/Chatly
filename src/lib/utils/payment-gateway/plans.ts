import type { PlanDefinition, SubscriptionPlan } from "@/types/subscription.md";

const MONTH_DAYS = 30;

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
      { label: "Dukungan prioritas", included: false },
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Untuk tim kecil yang sedang bertumbuh.",
    amount: 149_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    highlighted: true,
    features: [
      { label: "10.000 pesan / bulan", included: true },
      { label: "5 channel terhubung", included: true },
      { label: "Analitik lanjutan", included: true },
      { label: "Dukungan email", included: true },
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    description: "Untuk skala perusahaan dengan SLA.",
    amount: 349_000,
    currency: "IDR",
    interval: "month",
    intervalDays: MONTH_DAYS,
    features: [
      { label: "Pesan tak terbatas", included: true },
      { label: "Channel tak terbatas", included: true },
      { label: "Analitik real-time + ekspor", included: true },
      { label: "Dukungan prioritas 24/7", included: true },
    ],
  },
};

export function getPlan(plan: SubscriptionPlan): PlanDefinition {
  return PLANS[plan];
}

export function isPaidPlan(
  plan: SubscriptionPlan,
): plan is Exclude<SubscriptionPlan, "FREE"> {
  return plan !== "FREE";
}
