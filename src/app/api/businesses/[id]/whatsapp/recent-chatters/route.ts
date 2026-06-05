import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import type { RecentChatterDTO } from "@/types/ignore-list.md";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const RECENT_CHATTERS_LIMIT = 50;

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: businessId } = await context.params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { userId: true },
  });
  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [grouped, ignored] = await Promise.all([
      prisma.chatLog.groupBy({
        by: ["phone"],
        where: { businessId, role: "USER" },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: "desc" } },
        take: RECENT_CHATTERS_LIMIT,
      }),
      prisma.ignoredContact.findMany({
        where: { businessId },
        select: { phoneNumber: true },
      }),
    ]);

    const ignoredSet = new Set(ignored.map((entry) => entry.phoneNumber));

    const recentChatters: RecentChatterDTO[] = grouped.map((row) => ({
      phoneNumber: row.phone,
      lastMessageAt: (row._max.createdAt ?? new Date(0)).toISOString(),
      isIgnored: ignoredSet.has(row.phone),
    }));

    return NextResponse.json({ recentChatters });
  } catch (err) {
    console.error("[recent-chatters:GET] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat kontak terbaru" },
      { status: 500 }
    );
  }
}
