import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

interface ApiErrorResponse {
  message: string;
}

interface RevokeResponse {
  ok: true;
}

interface RouteContext {
  params: Promise<{ id: string; adminId: string }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<RevokeResponse | ApiErrorResponse>> {
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
      select: { userId: true },
    });
    if (!business || business.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Bisnis tidak ditemukan" },
        { status: 404 },
      );
    }

    const admin = await prisma.notificationAdmin.findFirst({
      where: { id: adminId, businessId: id },
      select: { id: true },
    });
    if (!admin) {
      return NextResponse.json(
        { message: "Admin notifikasi tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.notificationDevice.deleteMany({
        where: { notificationAdminId: adminId },
      }),
      prisma.notificationAdmin.update({
        where: { id: adminId },
        data: { status: "REVOKED" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /notification-admins/:adminId]", error);
    return NextResponse.json(
      { message: "Gagal mencabut admin notifikasi" },
      { status: 500 },
    );
  }
}
