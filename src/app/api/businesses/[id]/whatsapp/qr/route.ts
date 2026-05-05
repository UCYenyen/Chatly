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

function extractPhone(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const candidate =
    (o.phone as string) ??
    (o.phone_number as string) ??
    (o.jid as string) ??
    (o.id as string) ??
    null;
  if (typeof candidate !== "string") return null;
  const cleaned = candidate.split("@")[0]?.split(":")[0] ?? null;
  return cleaned || null;
}

type ConnectionState = "connected" | "disconnected" | "unknown";

function readConnectionState(obj: unknown): ConnectionState {
  if (!obj || typeof obj !== "object") return "unknown";
  const o = obj as Record<string, unknown>;

  if (o.is_logged_in === true || o.connected === true) return "connected";
  if (o.is_logged_in === false || o.connected === false) return "disconnected";

  if (typeof o.status === "string") {
    const s = o.status.toLowerCase();
    if (
      s === "connected" ||
      s === "logged_in" ||
      s === "online" ||
      s === "authenticated" ||
      s === "ready"
    ) {
      return "connected";
    }
    if (
      s === "disconnected" ||
      s === "logged_out" ||
      s === "offline" ||
      s === "pending" ||
      s === "qr"
    ) {
      return "disconnected";
    }
  }

  return "unknown";
}

async function fetchGowaDeviceInfo(
  deviceId: string
): Promise<{ connected: boolean; phoneNumber: string | null }> {
  const headersInit = {
    Accept: "application/json",
    "X-Device-Id": deviceId,
    ...gowaAuthHeader(),
  };

  try {
    const res = await fetch(`${GOWA_API_BASE}/devices/${deviceId}`, {
      method: "GET",
      headers: headersInit,
    });
    if (res.ok) {
      const data = await res.json();
      console.log("Gowa /devices/:id response:", JSON.stringify(data));
      const r = data.results ?? data;
      const state = readConnectionState(r);
      if (state === "disconnected") {
        return { connected: false, phoneNumber: null };
      }
      if (state === "connected") {
        const phone = extractPhone(r) ?? extractPhone(r?.user);
        return { connected: true, phoneNumber: phone };
      }
    }
  } catch (err) {
    console.error("Gowa /devices/:id error:", err);
  }

  try {
    const res = await fetch(`${GOWA_API_BASE}/user/info`, {
      method: "GET",
      headers: headersInit,
    });
    if (res.ok) {
      const data = await res.json();
      console.log("Gowa /user/info response:", JSON.stringify(data));
      const r = data.results ?? data;
      const state = readConnectionState(r);
      if (state === "connected") {
        const phone = extractPhone(r) ?? extractPhone(r?.user);
        return { connected: true, phoneNumber: phone };
      }
    }
  } catch (err) {
    console.error("Gowa /user/info error:", err);
  }

  return { connected: false, phoneNumber: null };
}

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
