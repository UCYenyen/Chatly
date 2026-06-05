import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import {
  previousMonth,
  runReportForBusiness,
} from "@/lib/utils/reports/scheduler";
import type { SendReportResponse } from "@/types/report.md";

interface ApiErrorResponse {
  message: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parsePeriod(
  period: string | null,
): { year: number; month: number } | null {
  if (!period) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<SendReportResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business || business.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Bisnis tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!business.monthlyReportEmail) {
      return NextResponse.json(
        { message: "Email tujuan laporan belum diatur" },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const target =
      parsePeriod(url.searchParams.get("period")) ?? previousMonth(new Date());

    const result = await runReportForBusiness({
      businessId: id,
      year: target.year,
      month: target.month,
      format: business.monthlyReportFormat,
      email: business.monthlyReportEmail,
      deleteAfterSend: false,
    });

    return NextResponse.json({
      sent: true,
      email: business.monthlyReportEmail,
      period: result.period,
      rowCount: result.rowCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/businesses/:id/reports/send]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
