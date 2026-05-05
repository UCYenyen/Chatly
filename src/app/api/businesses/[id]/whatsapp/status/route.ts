import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

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
      {
        auth: null,
        message: "No WhatsApp auth configured",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      auth: {
        id: whatsappAuth.id,
        businessId: whatsappAuth.businessId,
        authType: whatsappAuth.authType,
        status: whatsappAuth.status,
        phoneNumber: whatsappAuth.phoneNumber,
        qrCode: null,
        qrCodeExpiry: whatsappAuth.qrCodeExpiry,
        instanceKey: whatsappAuth.instanceKey,
        lastConnected: whatsappAuth.lastConnected,
        disconnectedAt: whatsappAuth.disconnectedAt,
      },
    },
    { status: 200 }
  );
}
