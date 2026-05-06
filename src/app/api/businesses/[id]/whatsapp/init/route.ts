import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

const rawGowaBase = process.env.GOWA_API_BASE || "http://localhost:3001";
const GOWA_API_BASE = rawGowaBase.replace(/\/+$/, "");
const GOWA_BASIC_AUTH_USER = process.env.GOWA_BASIC_AUTH_USER;
const GOWA_BASIC_AUTH_PASS = process.env.GOWA_BASIC_AUTH_PASS;

import { gowaAuthHeader } from "@/lib/utils/whatsapp";

function deviceHeader(deviceId: string): Record<string, string> {
  return { "X-Device-Id": deviceId };
}

async function createGowaDevice(): Promise<string> {
  const res = await fetch(`${GOWA_API_BASE}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...gowaAuthHeader(),
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to create Gowa device (status ${res.status})`
    );
  }

  const data = await res.json();
  console.log("Gowa create-device response:", JSON.stringify(data));

  const deviceId: string | undefined =
    data.results?.device_id ??
    data.device_id ??
    data.results?.id ??
    data.id;

  if (!deviceId) {
    throw new Error("Gowa create-device response did not contain device_id");
  }

  return deviceId;
}

async function generateGowaQrCode(
  deviceId: string
): Promise<{ qrCode: string; expiry: number }> {
  const response = await fetch(`${GOWA_API_BASE}/app/login`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...deviceHeader(deviceId),
      ...gowaAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to call Gowa /app/login (status ${response.status})`
    );
  }

  const data = await response.json();
  console.log("Gowa /app/login response:", JSON.stringify(data));

  const qrLink: string | undefined = data.results?.qr_link ?? data.qr_link;
  const expiry: number = data.results?.qr_duration ?? 60;

  if (!qrLink) {
    throw new Error("Gowa response did not contain a qr_link");
  }

  const externalUrl = qrLink.replace(/^https?:\/\/[^/]+/, GOWA_API_BASE);

  const imgRes = await fetch(externalUrl, {
    headers: { ...deviceHeader(deviceId), ...gowaAuthHeader() },
  });

  if (!imgRes.ok) {
    throw new Error(
      `Failed to fetch QR image from Gowa (status ${imgRes.status})`
    );
  }

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const mime = imgRes.headers.get("content-type") || "image/png";
  const qrCode = `data:${mime};base64,${buffer.toString("base64")}`;

  return { qrCode, expiry };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
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

  const body = await request.json();
  const { authType } = body as { authType: string };

  if (authType !== "GOWA") {
    return NextResponse.json(
      { error: "Currently only GOWA auth is supported" },
      { status: 400 }
    );
  }

  let whatsappAuth = await prisma.whatsAppAuth.findFirst({
    where: { businessId, authType: "GOWA" },
  });

  if (!whatsappAuth) {
    whatsappAuth = await prisma.whatsAppAuth.create({
      data: {
        businessId,
        authType: "GOWA",
        status: "PENDING",
      },
    });
  }

  try {
    if (!whatsappAuth.instanceKey) {
      const deviceId = await createGowaDevice();
      whatsappAuth = await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: { instanceKey: deviceId },
      });
    }

    let qr: { qrCode: string; expiry: number };
    try {
      qr = await generateGowaQrCode(whatsappAuth.instanceKey!);
    } catch (err) {
      console.warn(
        "Stored device failed, recreating:",
        err instanceof Error ? err.message : err
      );
      const deviceId = await createGowaDevice();
      whatsappAuth = await prisma.whatsAppAuth.update({
        where: { id: whatsappAuth.id },
        data: { instanceKey: deviceId },
      });
      qr = await generateGowaQrCode(whatsappAuth.instanceKey!);
    }
    const { qrCode, expiry } = qr;

    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiry);

    await prisma.whatsAppAuth.update({
      where: { id: whatsappAuth.id },
      data: { qrCode, qrCodeExpiry: expiryDate, status: "PENDING" },
    });

    return NextResponse.json(
      {
        qrCode,
        qrCodeExpiry: expiryDate.toISOString(),
        deviceId: whatsappAuth.instanceKey,
        message: "QR code generated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
