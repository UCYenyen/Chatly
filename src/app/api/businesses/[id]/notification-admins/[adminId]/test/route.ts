import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { isWebPushConfigured, sendPushToDevices } from "@/lib/utils/notifications/web-push";
import type { TestNotificationResponse } from "@/types/notifications.md";

interface ApiErrorResponse {
  message: string;
}

interface RouteContext {
  params: Promise<{ id: string; adminId: string }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<TestNotificationResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const { id, adminId } = await context.params;
    const business = await prisma.business.findUnique({
      where: { id },
      select: { userId: true, name: true },
    });
    if (!business || business.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Bisnis tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!isWebPushConfigured()) {
      return NextResponse.json(
        { message: "Notifikasi web push belum dikonfigurasi pada server ini" },
        { status: 503 },
      );
    }

    const admin = await prisma.notificationAdmin.findFirst({
      where: { id: adminId, businessId: id, status: "ACTIVE" },
      select: {
        label: true,
        devices: {
          select: { id: true, endpoint: true, p256dh: true, authKey: true },
        },
      },
    });
    if (!admin) {
      return NextResponse.json(
        { message: "Admin notifikasi tidak ditemukan" },
        { status: 404 },
      );
    }

    if (admin.devices.length === 0) {
      return NextResponse.json(
        { message: "Admin ini belum mendaftarkan perangkat" },
        { status: 400 },
      );
    }

    const result = await sendPushToDevices(admin.devices, {
      type: "test",
      businessName: business.name,
      message: `Notifikasi uji untuk ${admin.label}. Jika kamu melihat ini, notifikasi handover sudah aktif.`,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /notification-admins/:adminId/test]", error);
    return NextResponse.json(
      { message: "Gagal mengirim notifikasi uji" },
      { status: 500 },
    );
  }
}
