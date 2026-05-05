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
  businessId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}


export interface CreateSubscriptionRequest {
  plan: Exclude<SubscriptionPlan, "FREE">;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  invoiceUrl?: string;
  paymentId?: string;
  externalId?: string;
}

export interface SubscriptionStateResponse {
  subscription: SubscriptionDTO | null;
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
