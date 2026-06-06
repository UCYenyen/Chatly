import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";

interface ApiErrorResponse {
  message: string;
}

interface MarkTutorializedResponse {
  tutorializedFeatures: string[];
}

interface MarkTutorializedRequest {
  features: string[];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<MarkTutorializedResponse | ApiErrorResponse>> {
  try {
    const { id: businessId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId, userId: session.user.id },
      select: { id: true },
    });
    if (!business) {
      return NextResponse.json(
        { message: "Bisnis tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Partial<MarkTutorializedRequest>;
    const features = Array.isArray(body.features)
      ? body.features.filter((f): f is string => typeof f === "string")
      : [];

    const subscription = await prisma.subscription.findUnique({
      where: { businessId },
      select: { tutorializedFeatures: true },
    });
    if (!subscription) {
      return NextResponse.json(
        { message: "Langganan tidak ditemukan" },
        { status: 404 },
      );
    }

    const merged = Array.from(
      new Set([...subscription.tutorializedFeatures, ...features]),
    );

    await prisma.subscription.update({
      where: { businessId },
      data: { tutorializedFeatures: merged },
    });

    return NextResponse.json({ tutorializedFeatures: merged });
  } catch (error) {
    console.error("[POST /api/businesses/[id]/subscription/tutorialized]", error);
    return NextResponse.json(
      { message: "Gagal menyimpan status tutorial" },
      { status: 500 },
    );
  }
}
