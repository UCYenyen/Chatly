import prisma from "@/lib/utils/prisma";
import { xenditClient } from "@/lib/utils/payment-gateway/xendit";
import { getPlan, isPaidPlan } from "@/lib/utils/payment-gateway/plans";
import type {
  PaymentDTO,
  SubscriptionDTO,
  XenditInvoiceCallbackPayload,
} from "@/types/subscription.md";
import type {
  Payment,
  Subscription,
  SubscriptionPlan,
} from "@prisma/client";

const INVOICE_DURATION_SECONDS = 86_400;

interface AuthenticatedUser {
  id: string;
  email: string;
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

export interface CreateSubscriptionInvoiceResult {
  invoiceUrl: string;
  paymentId: string;
  externalId: string;
}

export async function createSubscriptionInvoice(
  user: AuthenticatedUser,
  planId: Exclude<SubscriptionPlan, "FREE">,
): Promise<CreateSubscriptionInvoiceResult> {
  if (!isPaidPlan(planId)) {
    throw new Error("Plan FREE tidak memerlukan pembayaran.");
  }

  const plan = getPlan(planId);

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: "FREE",
      status: "PENDING",
    },
  });

  const shortUser = user.id.slice(-6).toUpperCase();
  const externalId = `INV-${planId}-${shortUser}-${Date.now().toString(36).toUpperCase()}`;

  const baseUrl = getAppBaseUrl();
  const { Invoice } = xenditClient;
  const response = await Invoice.createInvoice({
    data: {
      externalId,
      amount: plan.amount,
      currency: plan.currency,
      payerEmail: user.email,
      description: `Langganan Chatly ${plan.name} (${plan.interval})`,
      invoiceDuration: INVOICE_DURATION_SECONDS,
      successRedirectUrl: `${baseUrl}/billing?paid=1&ext=${encodeURIComponent(externalId)}`,
      failureRedirectUrl: `${baseUrl}/billing?failed=1&ext=${encodeURIComponent(externalId)}`,
    },
  });

  if (!response.invoiceUrl || !response.id) {
    throw new Error("Xendit tidak mengembalikan invoice yang valid.");
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      subscriptionId: subscription.id,
      plan: planId,
      amount: plan.amount,
      currency: plan.currency,
      status: "PENDING",
      xenditExternalId: externalId,
      xenditInvoiceId: response.id,
      invoiceUrl: response.invoiceUrl,
    },
  });

  return {
    invoiceUrl: response.invoiceUrl,
    paymentId: payment.id,
    externalId,
  };
}

export async function handleXenditCallback(
  payload: XenditInvoiceCallbackPayload,
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { xenditExternalId: payload.external_id },
  });

  if (!payment) {
    return;
  }

  if (payload.status === "PAID" || payload.status === "SETTLED") {
    const plan = getPlan(payment.plan);
    const now = new Date();
    const periodEnd = new Date(now.getTime() + plan.intervalDays * 86_400_000);

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: payload.paid_at ? new Date(payload.paid_at) : now,
        },
      }),
      prisma.subscription.update({
        where: { userId: payment.userId },
        data: {
          plan: payment.plan,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      }),
    ]);
    return;
  }

  if (payload.status === "EXPIRED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "EXPIRED" },
    });
    return;
  }

  if (payload.status === "FAILED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }
}

export async function cancelPayment(
  userId: string,
  paymentId: string,
): Promise<{ status: "FAILED" }> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== userId) {
    throw new Error("Pembayaran tidak ditemukan");
  }
  if (payment.status === "PAID") {
    throw new Error("Pembayaran yang sudah berhasil tidak dapat dibatalkan");
  }
  if (payment.status === "FAILED") {
    return { status: "FAILED" };
  }

  if (payment.status === "PENDING" && payment.xenditInvoiceId) {
    try {
      const { Invoice } = xenditClient;
      await Invoice.expireInvoice({ invoiceId: payment.xenditInvoiceId });
    } catch (error) {
      console.warn("[cancelPayment] expireInvoice failed", error);
    }
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });

  return { status: "FAILED" };
}

export async function verifyPaymentByExternalId(
  userId: string,
  externalId: string,
): Promise<{ status: "PAID" | "PENDING" | "EXPIRED" | "FAILED" } | null> {
  const payment = await prisma.payment.findUnique({
    where: { xenditExternalId: externalId },
  });
  if (!payment || payment.userId !== userId) return null;

  if (!payment.xenditInvoiceId) return { status: payment.status === "PAID" ? "PAID" : "PENDING" };

  const { Invoice } = xenditClient;
  const remote = await Invoice.getInvoiceById({ invoiceId: payment.xenditInvoiceId });

  const remoteStatus = remote.status ?? "PENDING";
  const callbackStatus: XenditInvoiceCallbackPayload["status"] =
    remoteStatus === "PAID" || remoteStatus === "SETTLED"
      ? "PAID"
      : remoteStatus === "EXPIRED"
        ? "EXPIRED"
        : "PENDING";

  await handleXenditCallback({
    id: remote.id ?? payment.xenditInvoiceId,
    external_id: remote.externalId ?? externalId,
    status: callbackStatus,
    amount: remote.amount ?? payment.amount,
  });

  if (callbackStatus === "PAID") return { status: "PAID" };
  if (callbackStatus === "EXPIRED") return { status: "EXPIRED" };
  return { status: "PENDING" };
}

export async function cancelSubscription(userId: string): Promise<Subscription> {
  return prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    },
  });
}

export async function getSubscriptionState(userId: string): Promise<{
  subscription: SubscriptionDTO | null;
  payments: PaymentDTO[];
}> {
  const [subscription, payments] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    subscription: subscription ? toSubscriptionDTO(subscription) : null,
    payments: payments.map(toPaymentDTO),
  };
}

function toSubscriptionDTO(s: Subscription): SubscriptionDTO {
  return {
    id: s.id,
    plan: s.plan,
    status: s.status,
    currentPeriodStart: s.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    canceledAt: s.canceledAt?.toISOString() ?? null,
  };
}

function toPaymentDTO(p: Payment): PaymentDTO {
  return {
    id: p.id,
    plan: p.plan,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    invoiceUrl: p.invoiceUrl,
    xenditExternalId: p.xenditExternalId,
    paidAt: p.paidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}
