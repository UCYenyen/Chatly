import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      console.warn("[GET /api/businesses/:id/intents] Unauthorized access attempt");
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const params = await context.params;
    const businessId = params.id;
    console.log("[GET /api/businesses/:id/intents] businessId from params:", businessId);
    
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true }
    });

    if (!business) {
      console.warn("[GET /api/businesses/:id/intents] Business not found:", businessId);
      return NextResponse.json({ message: "Bisnis tidak ditemukan" }, { status: 404 });
    }

    if (business.userId !== session.user.id) {
      console.warn("[GET /api/businesses/:id/intents] Access denied. Owner:", business.userId, "User:", session.user.id);
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const intents = await prisma.businessIntent.findMany({
      where: { businessId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(intents);
  } catch (error) {
    console.error("[GET /api/businesses/:id/intents] Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data niat" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const params = await context.params;
    const businessId = params.id;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true }
    });

    if (!business || business.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ message: "Nama niat harus diisi" }, { status: 400 });
    }

    const newIntent = await prisma.businessIntent.create({
      data: {
        businessId,
        name: name.trim()
      }
    });

    return NextResponse.json(newIntent);
  } catch (error) {
    console.error("[POST /api/businesses/:id/intents] Error:", error);
    return NextResponse.json({ message: "Gagal menambah niat" }, { status: 500 });
  }
}
