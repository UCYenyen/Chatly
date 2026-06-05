import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import type {
  OnboardingStatusResponse,
  UpdateOnboardingRequest,
} from "@/types/tour.md";

interface ApiErrorResponse {
  message: string;
}

export async function GET(): Promise<
  NextResponse<OnboardingStatusResponse | ApiErrorResponse>
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  return NextResponse.json({
    onboardingCompleted: user?.onboardingCompleted ?? false,
  });
}

export async function PATCH(
  request: Request,
): Promise<NextResponse<OnboardingStatusResponse | ApiErrorResponse>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<UpdateOnboardingRequest>;
  if (typeof body.onboardingCompleted !== "boolean") {
    return NextResponse.json(
      { message: "onboardingCompleted harus berupa boolean" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: body.onboardingCompleted },
    select: { onboardingCompleted: true },
  });

  return NextResponse.json({ onboardingCompleted: updated.onboardingCompleted });
}
