import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import {
  PlanLimitError,
  enforceFeature,
  enforceNumericLimit,
  getBusinessPlan,
  planLimitResponse,
} from "@/lib/utils/payment-gateway/plan-guard";
import { toNotificationAdminDTO } from "@/lib/utils/notifications/admin-dto";
import type {
  CreateNotificationAdminRequest,
  NotificationAdminDTO,
} from "@/types/notifications.md";

interface ApiErrorResponse {
  message: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

const LABEL_MIN = 2;
const LABEL_MAX = 60;

async function authorizeOwner(
  businessId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse<ApiErrorResponse> }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      ),
    };
  }
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { userId: true },
  });
  if (!business || business.userId !== session.user.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Bisnis tidak ditemukan" },
        { status: 404 },
      ),
    };
  }
  return { ok: true };
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<NotificationAdminDTO[] | ApiErrorResponse>> {
  try {
    const { id } = await context.params;
    const guard = await authorizeOwner(id);
    if (!guard.ok) return guard.response;

    const admins = await prisma.notificationAdmin.findMany({
      where: { businessId: id, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { devices: true } } },
    });

    return NextResponse.json(admins.map(toNotificationAdminDTO));
  } catch (error) {
    console.error("[GET /notification-admins]", error);
    return NextResponse.json(
      { message: "Gagal memuat daftar admin notifikasi" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<NotificationAdminDTO | ApiErrorResponse>> {
  try {
    const { id } = await context.params;
    const guard = await authorizeOwner(id);
    if (!guard.ok) return guard.response;

    const plan = await getBusinessPlan(id);
    enforceFeature(plan, "adminNotification", "Notifikasi admin");

    const body = (await request.json()) as Partial<CreateNotificationAdminRequest>;
    const label = typeof body.label === "string" ? body.label.trim() : "";
    if (label.length < LABEL_MIN || label.length > LABEL_MAX) {
      return NextResponse.json(
        { message: `Nama admin harus ${LABEL_MIN}–${LABEL_MAX} karakter` },
        { status: 400 },
      );
    }

    const adminCount = await prisma.notificationAdmin.count({
      where: { businessId: id, status: "ACTIVE" },
    });
    enforceNumericLimit(plan, "adminSeats", adminCount, "admin handover");

    const admin = await prisma.notificationAdmin.create({
      data: {
        businessId: id,
        label,
        inviteToken: randomBytes(24).toString("hex"),
      },
      include: { _count: { select: { devices: true } } },
    });

    return NextResponse.json(toNotificationAdminDTO(admin), { status: 201 });
  } catch (error) {
    if (error instanceof PlanLimitError) {
      return planLimitResponse(error);
    }
    console.error("[POST /notification-admins]", error);
    return NextResponse.json(
      { message: "Gagal menambahkan admin notifikasi" },
      { status: 500 },
    );
  }
}
