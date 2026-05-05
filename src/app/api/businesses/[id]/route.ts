import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import type {
  BusinessDTO,
  UpdateBusinessRequest,
} from "@/types/business.md";
import type { Business } from "@prisma/client";

interface ApiErrorResponse {
  message: string;
}

interface DeleteResponse {
  ok: true;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toDTO(b: Business): BusinessDTO {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<BusinessDTO | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan" }, { status: 404 });
    }

    const body = (await request.json()) as Partial<UpdateBusinessRequest>;
    const data: UpdateBusinessRequest = {};

    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          { message: "Nama bisnis minimal 2 karakter" },
          { status: 400 },
        );
      }
      data.name = trimmed;
    }
    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string" && body.description.trim().length > 0
          ? body.description.trim()
          : null;
    }

    const updated = await prisma.business.update({ where: { id }, data });
    return NextResponse.json(toDTO(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[PATCH /api/businesses/:id]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse<DeleteResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Bisnis tidak ditemukan" }, { status: 404 });
    }

    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[DELETE /api/businesses/:id]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
