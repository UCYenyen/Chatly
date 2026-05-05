import type { PaymentStatus, PaymentType, SubscriptionPlan } from "@prisma/client";

export interface WalletStateResponse {
    balance: number;
    payments: PaymentDTO[];
}

export interface PaymentDTO {
    id: string;
    type: PaymentType;
    plan: SubscriptionPlan;
    amount: number;
    currency: string;
    status: PaymentStatus;
    invoiceUrl: string | null;
    xenditExternalId: string;
    businessId: string | null;
    businessName?: string;
    paidAt: string | null;
    createdAt: string;
}

export interface TopUpRequest {
    amount: number;
}

export interface TopUpResponse {
    invoiceUrl: string;
    paymentId: string;
    externalId: string;
}
