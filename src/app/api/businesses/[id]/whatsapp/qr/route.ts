import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { fetchGowaDeviceInfo } from "@/lib/utils/whatsapp";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: businessId } = await context.params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const whatsappAuth = await prisma.whatsAppAuth.findFirst({
    where: { businessId },
  });

  if (!whatsappAuth) {
    return NextResponse.json(
      { error: "No WhatsApp auth found" },
      { status: 404 }
    );
  }

  if (whatsappAuth.instanceKey) {
    const info = await fetchGowaDeviceInfo(whatsappAuth.instanceKey);
    if (info.connected) {
      const updated = await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: {
          status: "AUTHENTICATED",
          phoneNumber: info.phoneNumber,
          qrCode: null,
          qrCodeExpiry: null,
          lastConnected: new Date(),
        },
      });
      return NextResponse.json(
        { status: "AUTHENTICATED", phoneNumber: updated.phoneNumber },
        { status: 200 }
      );
    }
  }

  if (whatsappAuth.status === "AUTHENTICATED") {
    return NextResponse.json(
      { status: "AUTHENTICATED", phoneNumber: whatsappAuth.phoneNumber },
      { status: 200 }
    );
  }

  if (whatsappAuth.status === "EXPIRED") {
    return NextResponse.json({ status: "EXPIRED" }, { status: 200 });
  }

  if (!whatsappAuth.qrCode || !whatsappAuth.qrCodeExpiry) {
    return NextResponse.json(
      { error: "QR code not available" },
      { status: 404 }
    );
  }

  const now = new Date();
  if (whatsappAuth.qrCodeExpiry < now) {
    await prisma.whatsAppAuth.update({
      where: { id: whatsappAuth.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ status: "EXPIRED" }, { status: 200 });
  }

  return NextResponse.json(
    {
      qrCode: whatsappAuth.qrCode,
      qrCodeExpiry: whatsappAuth.qrCodeExpiry.toISOString(),
      status: "PENDING",
    },
    { status: 200 }
  );
}
