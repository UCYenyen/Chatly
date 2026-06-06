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
  params: Promise<{ id: string; intentId: string }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id: businessId, intentId } = await context.params;
    
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

    const intent = await prisma.businessIntent.findUnique({
      where: { id: intentId }
    });

    if (!intent || intent.businessId !== businessId) {
      return NextResponse.json({ message: "Niat tidak ditemukan" }, { status: 404 });
    }

    await prisma.businessIntent.delete({
      where: { id: intentId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/businesses/:id/intents/:intentId] Error:", error);
    return NextResponse.json({ message: "Gagal menghapus niat" }, { status: 500 });
  }
}
