import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import {
  getBusinessPlan,
  enforceFeature,
  PlanLimitError,
  planLimitResponse,
} from "@/lib/utils/payment-gateway/plan-guard";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id: businessId } = await context.params;

    // Security check
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true }
    });

    if (!business || business.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    const plan = await getBusinessPlan(businessId);
    try {
      enforceFeature(plan, "advancedAnalytics", "Analitik lanjutan");
    } catch (error) {
      if (error instanceof PlanLimitError) return planLimitResponse(error);
      throw error;
    }

    // Get all unique customers who chatted with the bot
    const chatCustomersData = await prisma.chatLog.findMany({
      where: { businessId },
      distinct: ['phone'],
      select: { phone: true }
    });

    const totalChatCustomers = chatCustomersData.length;
    const chatCustomers = chatCustomersData.map(c => c.phone);

    // Get all unique customers who made a purchase (status = PAID)
    const buyingCustomersData = await prisma.customerTransaction.findMany({
      where: {
        businessId,
        status: 'PAID'
      },
      distinct: ['customerPhone'],
      select: { customerPhone: true }
    });

    const totalBuyingCustomers = buyingCustomersData.length;
    const buyingCustomers = buyingCustomersData.map(c => c.customerPhone);

    const engagedCustomersData = await prisma.analyticsEvent.findMany({
      where: { businessId },
      distinct: ['phone'],
      select: { phone: true }
    });

    const totalEngagedCustomers = engagedCustomersData.length;

    // Calculate conversion rate
    const conversionRate = totalChatCustomers > 0
      ? (totalBuyingCustomers / totalChatCustomers) * 100
      : 0;

    // Get transactions with details
    const transactions = await prisma.customerTransaction.findMany({
      where: {
        businessId,
        status: 'PAID'
      },
      select: {
        id: true,
        customerPhone: true,
        name: true,
        amount: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const totalTransactions = await prisma.customerTransaction.count({
      where: {
        businessId,
        status: 'PAID'
      }
    });

    // Get total transaction value
    const totalRevenue = await prisma.customerTransaction.aggregate({
      where: {
        businessId,
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      totalChatCustomers,
      totalEngagedCustomers,
      totalBuyingCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100, // 2 decimal places
      totalTransactions,
      totalRevenue: totalRevenue._sum.amount || 0,
      conversionSummary: {
        label: "Conversion Rate",
        value: `${(Math.round(conversionRate * 100) / 100).toFixed(2)}%`,
        description: `${totalBuyingCustomers} dari ${totalChatCustomers} customer membeli`
      },
      details: {
        chatCustomers,
        buyingCustomers,
        transactions
      }
    });
  } catch (error) {
    console.error("[GET /api/businesses/:id/analytics/conversion-rate] Error:", error);
    return NextResponse.json({ message: "Gagal menghitung conversion rate" }, { status: 500 });
  }
}
