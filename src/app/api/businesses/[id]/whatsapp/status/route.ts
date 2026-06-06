import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { fetchGowaDeviceStatus } from "@/lib/utils/whatsapp";
import type { WhatsAppAuth } from "@prisma/client";
import type { WhatsAppAuthDTO } from "@/types/whatsapp.md";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toChannelDTO(channel: WhatsAppAuth): WhatsAppAuthDTO {
  return {
    id: channel.id,
    businessId: channel.businessId,
    authType: channel.authType,
    status: channel.status,
    phoneNumber: channel.phoneNumber,
    qrCode: channel.status === "PENDING" ? channel.qrCode : null,
    qrCodeExpiry: channel.qrCodeExpiry?.toISOString() ?? null,
    instanceKey: channel.instanceKey,
    lastConnected: channel.lastConnected?.toISOString() ?? null,
    disconnectedAt: channel.disconnectedAt?.toISOString() ?? null,
  };
}

async function syncChannelWithGowa(channel: WhatsAppAuth): Promise<WhatsAppAuth> {
  if (!channel.instanceKey) {
    return channel;
  }

  const info = await fetchGowaDeviceStatus(channel.instanceKey);

  if (info.connected && channel.status !== "AUTHENTICATED") {
    return prisma.whatsAppAuth.update({
      where: { id: channel.id },
      data: {
        status: "AUTHENTICATED",
        phoneNumber: info.phoneNumber,
        qrCode: null,
        qrCodeExpiry: null,
        lastConnected: new Date(),
        disconnectedAt: null,
      },
    });
  }

  if (info.connected && channel.status === "AUTHENTICATED") {
    if (!channel.phoneNumber && info.phoneNumber) {
      return prisma.whatsAppAuth.update({
        where: { id: channel.id },
        data: { phoneNumber: info.phoneNumber },
      });
    }
    return channel;
  }

  if (!info.connected && channel.status === "AUTHENTICATED") {
    return prisma.whatsAppAuth.update({
      where: { id: channel.id },
      data: {
        status: "DISCONNECTED",
        disconnectedAt: new Date(),
      },
    });
  }

  return channel;
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

  const channels = await prisma.whatsAppAuth.findMany({
    where: { businessId },
    orderBy: { createdAt: "asc" },
  });

  const syncedChannels: WhatsAppAuthDTO[] = [];
  for (const channel of channels) {
    const synced = await syncChannelWithGowa(channel);
    syncedChannels.push(toChannelDTO(synced));
  }

  return NextResponse.json({ channels: syncedChannels }, { status: 200 });
}
