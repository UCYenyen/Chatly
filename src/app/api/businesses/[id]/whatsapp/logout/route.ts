import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

const GOWA_API_BASE = process.env.GOWA_API_BASE || "http://localhost:3001";
const GOWA_BASIC_AUTH_USER = process.env.GOWA_BASIC_AUTH_USER;
const GOWA_BASIC_AUTH_PASS = process.env.GOWA_BASIC_AUTH_PASS;

function gowaAuthHeader(): Record<string, string> {
  if (!GOWA_BASIC_AUTH_USER || !GOWA_BASIC_AUTH_PASS) return {};
  const token = Buffer.from(
    `${GOWA_BASIC_AUTH_USER}:${GOWA_BASIC_AUTH_PASS}`
  ).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function logoutGowaInstance(deviceId: string): Promise<void> {
  try {
    await fetch(`${GOWA_API_BASE}/app/logout`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Device-Id": deviceId,
        ...gowaAuthHeader(),
      },
    });
  } catch (error) {
    console.error("Error calling Gowa logout API:", error);
  }

  try {
    await fetch(`${GOWA_API_BASE}/devices/${deviceId}`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...gowaAuthHeader() },
    });
  } catch (error) {
    console.error("Error deleting Gowa device:", error);
  }
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
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
    await logoutGowaInstance(whatsappAuth.instanceKey);
  }

  await prisma.whatsAppAuth.update({
    where: { id: whatsappAuth.id },
    data: {
      status: "DISCONNECTED",
      phoneNumber: null,
      qrCode: null,
      qrCodeExpiry: null,
      lastConnected: null,
      disconnectedAt: new Date(),
    },
  });

  return NextResponse.json(
    { success: true, message: "Logout successful" },
    { status: 200 }
  );
}
