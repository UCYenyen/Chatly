import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import {
  PlanLimitError,
  enforceFeature,
  getBusinessPlan,
  planLimitResponse,
} from "@/lib/utils/payment-gateway/plan-guard";
import { DEFAULT_AI_TONE } from "@/lib/utils/payment-gateway/plan-limits";
import type {
  BusinessDTO,
  UpdateBusinessRequest,
} from "@/types/business.md";
import { toBusinessDTO } from "@/lib/utils/business-dto";
import {
  isWeeklyHours,
  SUPPORTED_TIMEZONES,
} from "@/types/business-hours.md";
import { Prisma } from "@prisma/client";

interface ApiErrorResponse {
  message: string;
}

interface DeleteResponse {
  ok: true;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<BusinessDTO | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan" }, { status: 404 });
    }

    const body = (await request.json()) as Partial<UpdateBusinessRequest>;
    const data: Prisma.BusinessUpdateInput = {};

    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { message: "Nama bisnis minimal 2 karakter" },
          { status: 400 },
        );
      }
      data.name = trimmed;
    }
    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string" && body.description.trim().length > 0
          ? body.description.trim()
          : null;
    }
    if (body.knowledgeBase !== undefined) {
      data.knowledgeBase = body.knowledgeBase;
    }
    if (body.aiTone !== undefined) {
      if (body.aiTone && body.aiTone !== DEFAULT_AI_TONE) {
        const plan = await getBusinessPlan(id);
        enforceFeature(plan, "customPersonality", "Kepribadian AI kustom");
      }
      data.aiTone = body.aiTone;
    }
    if (Array.isArray(body.knowledgeFiles)) {
      data.knowledgeFiles = body.knowledgeFiles;
    }
    if (typeof body.handoverHoursEnabled === "boolean") {
      data.handoverHoursEnabled = body.handoverHoursEnabled;
    }
    if (body.timezone !== undefined) {
      if (body.timezone !== null && !SUPPORTED_TIMEZONES.includes(body.timezone)) {
        return NextResponse.json(
          { message: "Zona waktu tidak valid" },
          { status: 400 },
        );
      }
      data.timezone = body.timezone;
    }
    if (body.businessHours !== undefined) {
      if (body.businessHours !== null && !isWeeklyHours(body.businessHours)) {
        return NextResponse.json(
          { message: "Format jam buka tidak valid" },
          { status: 400 },
        );
      }
      data.businessHours =
        body.businessHours === null
          ? Prisma.JsonNull
          : (body.businessHours as unknown as Prisma.InputJsonValue);
    }

    if (body.notificationPhone !== undefined) {
      if (body.notificationPhone === null || body.notificationPhone.trim().length === 0) {
        data.notificationPhone = null;
      } else {
        const normalized = body.notificationPhone.replace(/[^\d+]/g, "");
        if (normalized.replace(/\D/g, "").length < 8) {
          return NextResponse.json(
            { message: "Nomor WhatsApp notifikasi tidak valid" },
            { status: 400 },
          );
        }
        data.notificationPhone = normalized;
      }
    }

    if (typeof body.monthlyReportEnabled === "boolean") {
      data.monthlyReportEnabled = body.monthlyReportEnabled;
    }
    if (body.monthlyReportEmail !== undefined) {
      if (
        body.monthlyReportEmail === null ||
        body.monthlyReportEmail.trim().length === 0
      ) {
        data.monthlyReportEmail = null;
      } else {
        const email = body.monthlyReportEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return NextResponse.json(
            { message: "Email laporan tidak valid" },
            { status: 400 },
          );
        }
        data.monthlyReportEmail = email;
      }
    }
    if (body.monthlyReportFormat !== undefined) {
      if (
        body.monthlyReportFormat !== "CSV" &&
        body.monthlyReportFormat !== "XLSX"
      ) {
        return NextResponse.json(
          { message: "Format laporan tidak valid" },
          { status: 400 },
        );
      }
      data.monthlyReportFormat = body.monthlyReportFormat;
    }

    console.log("[PATCH /api/businesses/:id] data:", JSON.stringify(data, null, 2));
    const updated = await prisma.business.update({ where: { id }, data });
    return NextResponse.json(toBusinessDTO(updated));
  } catch (error) {
    if (error instanceof PlanLimitError) {
      return planLimitResponse(error);
    }
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[PATCH /api/businesses/:id]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<DeleteResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan" }, { status: 404 });
    }

    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[DELETE /api/businesses/:id]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
