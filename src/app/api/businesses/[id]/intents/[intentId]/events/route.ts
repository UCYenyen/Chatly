import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

interface RouteContext {
  params: Promise<{ id: string; intentId: string }>;
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

    const { id: businessId, intentId } = await context.params;
    
    // Security check
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true }
    });

    if (!business || business.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    // Get the intent to know its name
    const intent = await prisma.businessIntent.findUnique({
      where: { id: intentId }
    });

    if (!intent || intent.businessId !== businessId) {
      return NextResponse.json({ message: "Niat tidak ditemukan" }, { status: 404 });
    }

    // 1. Fetch real analytics events matching the intent name (category)
    const events = await prisma.analyticsEvent.findMany({
      where: {
        businessId,
        intentCategory: intent.name
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    // 2. Fetch summary stats
    const totalMessages = await prisma.analyticsEvent.count({
      where: {
        businessId,
        intentCategory: intent.name
      }
    });

    const uniqueUsersResult = await prisma.analyticsEvent.groupBy({
      by: ['phone'],
      where: {
        businessId,
        intentCategory: intent.name
      }
    });
    const totalConversations = uniqueUsersResult.length;

    return NextResponse.json({
      events,
      stats: {
        totalMessages,
        totalConversations
      }
    });
  } catch (error) {
    console.error("[GET /api/businesses/:id/intents/:intentId/events] Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data log" }, { status: 500 });
  }
}
