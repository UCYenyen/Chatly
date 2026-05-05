import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { fetchGowaDeviceStatus } from "@/lib/utils/whatsapp";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/businesses/:id/whatsapp/status
 *
 * Called on page load AND by the polling hook.
 * 1. If a device (instanceKey) exists, checks Gowa in real time.
 * 2. Syncs the DB to match Gowa's actual state.
 * 3. Returns the authoritative state to the frontend.
 */
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

  let whatsappAuth = await prisma.whatsAppAuth.findFirst({
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

  // ── Real-time check against Gowa ──────────────────────────────────────
  if (whatsappAuth.instanceKey) {
    const info = await fetchGowaDeviceStatus(whatsappAuth.instanceKey);

    if (info.connected && whatsappAuth.status !== "AUTHENTICATED") {
      // Device just logged in — update DB
      whatsappAuth = await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: {
          status: "AUTHENTICATED",
          phoneNumber: info.phoneNumber,
          qrCode: null,
          qrCodeExpiry: null,
          lastConnected: new Date(),
          disconnectedAt: null,
        },
      });
    } else if (info.connected && whatsappAuth.status === "AUTHENTICATED") {
      // Already authenticated, just refresh phone if missing
      if (!whatsappAuth.phoneNumber && info.phoneNumber) {
        whatsappAuth = await prisma.whatsAppAuth.update({
          where: { id: whatsappAuth.id },
          data: { phoneNumber: info.phoneNumber },
        });
      }
    } else if (!info.connected && whatsappAuth.status === "AUTHENTICATED") {
      // Device disconnected — update DB
      whatsappAuth = await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: {
          status: "DISCONNECTED",
          disconnectedAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json(
    {
      auth: {
        id: whatsappAuth.id,
        businessId: whatsappAuth.businessId,
        authType: whatsappAuth.authType,
        status: whatsappAuth.status,
        phoneNumber: whatsappAuth.phoneNumber,
        qrCode: whatsappAuth.status === "PENDING" ? whatsappAuth.qrCode : null,
        qrCodeExpiry: whatsappAuth.qrCodeExpiry?.toISOString() ?? null,
        instanceKey: whatsappAuth.instanceKey,
        lastConnected: whatsappAuth.lastConnected?.toISOString() ?? null,
        disconnectedAt: whatsappAuth.disconnectedAt?.toISOString() ?? null,
      },
    },
    { status: 200 }
  );
}
