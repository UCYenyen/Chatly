import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import type {
  BusinessDTO,
  BusinessListResponse,
  CreateBusinessRequest,
} from "@/types/business.md";
import type { PlanLimitErrorBody } from "@/types/plan-limits.md";
import { toBusinessDTO } from "@/lib/utils/business-dto";
import {
  getUserPlan,
  enforceNumericLimit,
  PlanLimitError,
  planLimitResponse,
} from "@/lib/utils/payment-gateway/plan-guard";

interface ApiErrorResponse {
  message: string;
}

export async function GET(): Promise<
  NextResponse<BusinessListResponse | ApiErrorResponse>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ businesses: businesses.map(toBusinessDTO) });
}

export async function POST(
  request: Request,
): Promise<NextResponse<BusinessDTO | ApiErrorResponse | PlanLimitErrorBody>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<CreateBusinessRequest>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2) {
      return NextResponse.json(
        { message: "Nama bisnis minimal 2 karakter" },
        { status: 400 },
      );
    }
    const description =
      typeof body.description === "string" && body.description.trim().length > 0
        ? body.description.trim()
        : null;

    const userPlan = await getUserPlan(session.user.id);
    const existingBusinessCount = await prisma.business.count({
      where: { userId: session.user.id },
    });
    try {
      enforceNumericLimit(userPlan, "channels", existingBusinessCount, "channel WhatsApp");
    } catch (error) {
      if (error instanceof PlanLimitError) return planLimitResponse(error);
      throw error;
    }

    const created = await prisma.business.create({
      data: {
        userId: session.user.id,
        name,
        description,
      },
    });

    return NextResponse.json(toBusinessDTO(created), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/businesses]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
