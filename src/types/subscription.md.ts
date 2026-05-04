import type {
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentStatus,
} from "@prisma/client";

export type { SubscriptionPlan, SubscriptionStatus, PaymentStatus };

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PlanDefinition {
  id: SubscriptionPlan;
  name: string;
  description: string;
  amount: number;
  currency: "IDR";
  interval: "month";
  intervalDays: number;
  features: PlanFeature[];
  highlighted?: boolean;
}

export interface SubscriptionDTO {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

export interface PaymentDTO {
  id: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoiceUrl: string | null;
  xenditExternalId: string;
  paidAt: string | null;
  createdAt: string;
}

export interface CreateSubscriptionRequest {
  plan: Exclude<SubscriptionPlan, "FREE">;
}

export interface CreateSubscriptionResponse {
  invoiceUrl: string;
  paymentId: string;
  externalId: string;
}

export interface SubscriptionStateResponse {
  subscription: SubscriptionDTO | null;
  payments: PaymentDTO[];
}

export interface XenditInvoiceCallbackPayload {
  id: string;
  external_id: string;
  status: "PENDING" | "PAID" | "SETTLED" | "EXPIRED" | "FAILED";
  amount: number;
  paid_at?: string;
  payment_method?: string;
  payment_channel?: string;
  payer_email?: string;
  description?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
}
