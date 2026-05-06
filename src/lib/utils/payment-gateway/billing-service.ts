import prisma from "@/lib/utils/prisma";
import { xenditClient } from "@/lib/utils/payment-gateway/xendit";
import { getPlan, isPaidPlan } from "@/lib/utils/payment-gateway/plans";
import { sendGowaMessage } from "@/lib/utils/whatsapp";
import type {
    SubscriptionDTO,
    XenditInvoiceCallbackPayload,
} from "@/types/subscription.md";
import type {
    Payment,
    Subscription,
    SubscriptionPlan,
    PaymentType,
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

export interface PaymentInvoiceResult {
    invoiceUrl: string;
    paymentId: string;
    externalId: string;
}

/**
 * Create a Top-up Invoice for a User
 */
export async function createTopUpInvoice(
    user: AuthenticatedUser,
    amount: number,
): Promise<PaymentInvoiceResult> {
    if (amount < 10000) {
        throw new Error("Minimal top up adalah Rp 10.000");
    }

    const shortUser = user.id.slice(-6).toUpperCase();
    const externalId = `TOP-${shortUser}-${Date.now().toString(36).toUpperCase()}`;

    const baseUrl = getAppBaseUrl();
    const { Invoice } = xenditClient;
    const response = await Invoice.createInvoice({
        data: {
            externalId,
            amount,
            currency: "IDR",
            payerEmail: user.email,
            description: `Top Up Saldo Chatly`,
            invoiceDuration: INVOICE_DURATION_SECONDS,
            successRedirectUrl: `${baseUrl}/billing?paid=1&ext=${encodeURIComponent(externalId)}`,
            failureRedirectUrl: `${baseUrl}/billing?failed=1&ext=${encodeURIComponent(externalId)}`,
        },
    });

    if (!response.invoiceUrl || !response.id) {
        throw new Error("Xendit tidak mengembalikan invoice yang valid.");
    }

    console.log("[createTopUpInvoice] Creating payment record in DB...", {
        userId: user.id,
        externalId,
        xenditId: response.id
    });

    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            type: "TOPUP",
            plan: "FREE",
            amount,
            currency: "IDR",
            status: "PENDING",
            xenditExternalId: externalId,
            xenditInvoiceId: response.id,
            invoiceUrl: response.invoiceUrl,
        },
    });

    console.log("[createTopUpInvoice] Payment record created successfully:", payment.id);

    return {
        invoiceUrl: response.invoiceUrl,
        paymentId: payment.id,
        externalId,
    };
}

/**
 * Create a Subscription Invoice for a Business
 */
export async function createSubscriptionInvoice(
    user: AuthenticatedUser,
    businessId: string,
    planId: Exclude<SubscriptionPlan, "FREE">,
): Promise<PaymentInvoiceResult> {
    const plan = getPlan(planId);

    // Ensure subscription record exists for the business
    const subscription = await prisma.subscription.upsert({
        where: { businessId },
        update: {},
        create: {
            businessId,
            plan: "FREE",
            status: "PENDING",
        },
    });

    const shortBiz = businessId.slice(-6).toUpperCase();
    const externalId = `SUB-${planId}-${shortBiz}-${Date.now().toString(36).toUpperCase()}`;

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
            businessId,
            subscriptionId: subscription.id,
            type: "SUBSCRIPTION",
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

/**
 * Create a Custom Transaction Invoice for an End-Customer
 */
export async function createCustomerTransactionInvoice(
    businessId: string,
    customerPhone: string,
    name: string,
    amount: number,
    description?: string,
): Promise<PaymentInvoiceResult> {
    if (amount < 1000) {
        throw new Error("Minimal transaksi adalah Rp 1.000");
    }

    const shortBiz = businessId.slice(-6).toUpperCase();
    const externalId = `TRX-${shortBiz}-${Date.now().toString(36).toUpperCase()}`;

    const baseUrl = getAppBaseUrl();
    const { Invoice } = xenditClient;
    const response = await Invoice.createInvoice({
        data: {
            externalId,
            amount,
            currency: "IDR",
            description: `${name}${description ? ` - ${description}` : ""}`,
            invoiceDuration: INVOICE_DURATION_SECONDS,
        },
    });

    if (!response.invoiceUrl || !response.id) {
        throw new Error("Xendit tidak mengembalikan invoice yang valid.");
    }

    const transaction = await prisma.customerTransaction.create({
        data: {
            businessId,
            customerPhone,
            name,
            description,
            amount,
            status: "PENDING",
            xenditExternalId: externalId,
            xenditInvoiceId: response.id,
            invoiceUrl: response.invoiceUrl,
        },
    });

    return {
        invoiceUrl: response.invoiceUrl,
        paymentId: transaction.id,
        externalId,
    };
}


export async function handleXenditCallback(
    payload: XenditInvoiceCallbackPayload,
): Promise<void> {
    const payment = await prisma.payment.findUnique({
        where: { xenditExternalId: payload.external_id },
    });

    const customerTransaction = await prisma.customerTransaction.findUnique({
        where: { xenditExternalId: payload.external_id },
    });

    // If neither record exists, nothing to process
    if (!payment && !customerTransaction) return;

    if (payload.status === "PAID" || payload.status === "SETTLED") {
        const now = new Date();
        const paidAt = payload.paid_at ? new Date(payload.paid_at) : now;

        // ── Handle Payment (Top-up / Subscription) ──────────────────────────
        if (payment && payment.status !== "PAID") {
            if (payment.type === "TOPUP") {
                await prisma.$transaction(async (tx) => {
                    const currentPayment = await tx.payment.findUnique({
                        where: { id: payment.id },
                    });

                    if (!currentPayment || currentPayment.status === "PAID") {
                        console.log(`[handleXenditCallback] Top-up ${payment.id} already processed.`);
                        return;
                    }

                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: "PAID", paidAt },
                    });

                    await tx.user.update({
                        where: { id: payment.userId },
                        data: { balance: { increment: payment.amount } },
                    });
                });
            } else if (payment.type === "SUBSCRIPTION" && payment.businessId) {
                await prisma.$transaction(async (tx) => {
                    const currentPayment = await tx.payment.findUnique({
                        where: { id: payment.id },
                    });

                    if (!currentPayment || currentPayment.status === "PAID") {
                        console.log(`[handleXenditCallback] Subscription ${payment.id} already processed.`);
                        return;
                    }

                    const plan = getPlan(payment.plan);
                    const periodEnd = new Date(now.getTime() + plan.intervalDays * 86_400_000);

                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: "PAID", paidAt },
                    });

                    await tx.subscription.update({
                        where: { businessId: payment.businessId! },
                        data: {
                            plan: payment.plan,
                            status: "ACTIVE",
                            currentPeriodStart: now,
                            currentPeriodEnd: periodEnd,
                            cancelAtPeriodEnd: false,
                            canceledAt: null,
                        },
                    });
                });
            }
        }

        // ── Handle Customer Transaction ─────────────────────────────────────
        if (customerTransaction && customerTransaction.status !== "PAID") {
            await prisma.$transaction(async (tx) => {
                // Update transaction status
                await tx.customerTransaction.update({
                    where: { id: customerTransaction.id },
                    data: { status: "PAID", paidAt },
                });

                // Find the business to get the owner (userId)
                const business = await tx.business.findUnique({
                    where: { id: customerTransaction.businessId },
                    select: { userId: true },
                });

                if (business) {
                    // Add balance to the owner
                    await tx.user.update({
                        where: { id: business.userId },
                        data: { balance: { increment: customerTransaction.amount } },
                    });
                    console.log(`[handleXenditCallback] Credited ${customerTransaction.amount} to user ${business.userId} for transaction ${customerTransaction.id}`);
                }
            });

            // Send WhatsApp Confirmation to Customer
            try {
                const whatsappAuth = await prisma.whatsAppAuth.findFirst({
                    where: { 
                        businessId: customerTransaction.businessId,
                        status: "AUTHENTICATED",
                        instanceKey: { not: null }
                    }
                });

                if (whatsappAuth?.instanceKey) {
                    const amountFormatted = `Rp ${new Intl.NumberFormat("id-ID").format(customerTransaction.amount)}`;
                    const messageText = `✅ *Pembayaran Berhasil*\n\nTerima kasih, pembayaran sebesar *${amountFormatted}* untuk *${customerTransaction.name}* telah kami terima.`;
                    
                    await sendGowaMessage(customerTransaction.customerPhone, messageText, whatsappAuth.instanceKey);
                    
                    await prisma.chatLog.create({
                        data: {
                            businessId: customerTransaction.businessId,
                            phone: customerTransaction.customerPhone,
                            role: "AI",
                            content: messageText,
                        }
                    });
                    
                    console.log(`[handleXenditCallback] Sent confirmation WA to ${customerTransaction.customerPhone}`);
                }
            } catch (err) {
                console.error("[handleXenditCallback] Failed to send WA confirmation:", err);
            }
        }

        return;
    }

    if (payload.status === "EXPIRED" || payload.status === "FAILED") {
        if (payment) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: payload.status as any },
            });
        }

        if (customerTransaction) {
            await prisma.customerTransaction.update({
                where: { id: customerTransaction.id },
                data: { status: payload.status as any },
            });
        }
    }
}


export async function verifyPaymentByExternalId(
    userId: string,
    externalId: string,
): Promise<{ status: string } | null> {
    const payment = await prisma.payment.findUnique({
        where: { xenditExternalId: externalId },
    });
    if (!payment || payment.userId !== userId) return null;

    if (payment.status === "PAID") return { status: "PAID" };

    if (!payment.xenditInvoiceId) return { status: "PENDING" };

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

    return { status: callbackStatus };
}

/**
 * Sync all PENDING customer transactions for a business by checking Xendit directly.
 * Called when the dashboard loads the transaction list.
 */
export async function syncPendingCustomerTransactions(businessId: string): Promise<void> {
    const pendingTxns = await prisma.customerTransaction.findMany({
        where: { businessId, status: "PENDING" },
        select: { id: true, xenditInvoiceId: true, xenditExternalId: true, amount: true },
    });

    if (pendingTxns.length === 0) return;

    const { Invoice } = xenditClient;

    await Promise.allSettled(
        pendingTxns.map(async (txn) => {
            if (!txn.xenditInvoiceId) return;

            try {
                const remote = await Invoice.getInvoiceById({ invoiceId: txn.xenditInvoiceId });
                const remoteStatus = remote.status ?? "PENDING";

                if (remoteStatus === "PENDING") return; // Still pending, skip

                const callbackStatus: XenditInvoiceCallbackPayload["status"] =
                    remoteStatus === "PAID" || remoteStatus === "SETTLED"
                        ? "PAID"
                        : remoteStatus === "EXPIRED"
                            ? "EXPIRED"
                            : "PENDING";

                if (callbackStatus === "PENDING") return;

                console.log(`[syncPendingTxn] ${txn.xenditExternalId} status=${callbackStatus}`);

                await handleXenditCallback({
                    id: remote.id ?? txn.xenditInvoiceId,
                    external_id: remote.externalId ?? txn.xenditExternalId,
                    status: callbackStatus,
                    amount: remote.amount ?? txn.amount,
                    paid_at: (remote as any).paidAt ?? (remote as any).paid_at,
                });
            } catch (err) {
                console.error(`[syncPendingTxn] Failed for ${txn.xenditExternalId}:`, err);
            }
        })
    );
}

export async function cancelSubscription(businessId: string): Promise<Subscription> {
    return prisma.subscription.update({
        where: { businessId },
        data: {
            cancelAtPeriodEnd: true,
            canceledAt: new Date(),
        },
    });
}

export async function getSubscriptionState(businessId: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({
        where: { businessId },
    });
}

/**
 * Pay for a subscription using user's wallet balance
 */
export async function paySubscriptionWithWallet(
    userId: string,
    businessId: string,
    planId: Exclude<SubscriptionPlan, "FREE">,
): Promise<{ success: boolean; paymentId: string }> {
    const plan = getPlan(planId);

    // 1. Get user to check balance
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new Error("User tidak ditemukan");
    if (user.balance < plan.amount) {
        throw new Error(`Saldo tidak mencukupi. Dibutuhkan ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(plan.amount)}, saldo Anda ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(user.balance)}`);
    }

    // 2. Process payment and subscription update in a transaction
    const now = new Date();
    const periodEnd = new Date(now.getTime() + plan.intervalDays * 86_400_000);
    const externalId = `WAL-${planId}-${businessId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const [payment] = await prisma.$transaction([
        // Create PAID payment record
        prisma.payment.create({
            data: {
                userId,
                businessId,
                type: "SUBSCRIPTION",
                plan: planId,
                amount: plan.amount,
                currency: plan.currency,
                status: "PAID",
                paidAt: now,
                xenditExternalId: externalId,
            },
        }),
        // Deduct balance
        prisma.user.update({
            where: { id: userId },
            data: { balance: { decrement: plan.amount } },
        }),
        // Upsert subscription
        prisma.subscription.upsert({
            where: { businessId },
            update: {
                plan: planId,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
                canceledAt: null,
            },
            create: {
                businessId,
                plan: planId,
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
        }),
    ]);

    return { success: true, paymentId: payment.id };
}
