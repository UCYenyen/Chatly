import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import { processAndSaveKnowledgeBase } from "@/lib/rag-ingestion";
import type { BusinessDTO } from "@/types/business.md";
import type { Business } from "@prisma/client";

interface ApiErrorResponse {
  message: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function toDTO(b: Business): BusinessDTO {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    knowledgeBase: b.knowledgeBase,
    aiTone: b.aiTone,
    knowledgeFiles: b.knowledgeFiles,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export async function POST(
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

    const form = await request.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ message: "Tidak ada file yang dikirim" }, { status: 400 });
    }

    const uploadedNames: string[] = [];
    for (const file of files) {
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          { message: `Tipe file tidak didukung: ${file.name} (${file.type})` },
          { status: 400 },
        );
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { message: `File terlalu besar (maks 10MB): ${file.name}` },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { chunkCount } = await processAndSaveKnowledgeBase(id, {
        buffer,
        mimeType: file.type,
      });
      console.log(
        `[POST knowledge-files] business=${id} file=${file.name} chunks=${chunkCount}`,
      );
      uploadedNames.push(file.name);
    }

    const merged = Array.from(new Set([...(existing.knowledgeFiles || []), ...uploadedNames]));
    const updated = await prisma.business.update({
      where: { id },
      data: { knowledgeFiles: merged },
    });

    return NextResponse.json(toDTO(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/businesses/:id/knowledge-files]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
