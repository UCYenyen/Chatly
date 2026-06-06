import { NextResponse } from "next/server";
import prisma from "@/lib/utils/prisma";
import type {
  PushSubscriptionInput,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
} from "@/types/notifications.md";

interface ApiErrorResponse {
  message: string;
}

function isValidSubscription(value: unknown): value is PushSubscriptionInput {
  if (typeof value !== "object" || value === null) return false;
  const sub = value as Record<string, unknown>;
  if (typeof sub.endpoint !== "string" || sub.endpoint.length === 0) {
    return false;
  }
  const keys = sub.keys as Record<string, unknown> | undefined;
  return (
    typeof keys === "object" &&
    keys !== null &&
    typeof keys.p256dh === "string" &&
    typeof keys.auth === "string"
  );
}

export async function POST(
  request: Request,
): Promise<NextResponse<RegisterDeviceResponse | ApiErrorResponse>> {
  try {
    const body = (await request.json()) as Partial<RegisterDeviceRequest>;

    if (typeof body.token !== "string" || body.token.length === 0) {
      return NextResponse.json(
        { message: "Token undangan tidak valid" },
        { status: 400 },
      );
    }
    if (!isValidSubscription(body.subscription)) {
      return NextResponse.json(
        { message: "Data langganan push tidak valid" },
        { status: 400 },
      );
    }

    const admin = await prisma.notificationAdmin.findFirst({
      where: { inviteToken: body.token, status: "ACTIVE" },
      select: { id: true, business: { select: { name: true } } },
    });
    if (!admin) {
      return NextResponse.json(
        { message: "Undangan tidak berlaku atau sudah dicabut" },
        { status: 404 },
      );
    }

    const subscription = body.subscription;
    const userAgent =
      typeof body.userAgent === "string" ? body.userAgent.slice(0, 255) : null;

    await prisma.notificationDevice.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        notificationAdminId: admin.id,
        p256dh: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userAgent,
        lastSeenAt: new Date(),
      },
      create: {
        notificationAdminId: admin.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userAgent,
      },
    });

    return NextResponse.json({ businessName: admin.business.name });
  } catch (error) {
    console.error("[POST /api/notify/register]", error);
    return NextResponse.json(
      { message: "Gagal mendaftarkan perangkat" },
      { status: 500 },
    );
  }
}
