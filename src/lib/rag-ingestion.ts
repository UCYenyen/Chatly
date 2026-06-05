import { randomUUID } from "crypto";
import prisma from "@/lib/utils/prisma";
import { embedTexts } from "@/lib/ai-providers/embeddings";
import { extractDocumentText } from "@/lib/ai-providers/extraction";

export interface IngestInput {
  buffer: Buffer;
  mimeType: string;
}

export async function processAndSaveKnowledgeBase(
  businessId: string,
  input: IngestInput,
  { append = false }: { append?: boolean } = {},
): Promise<{ chunkCount: number }> {
  const extractedText = await extractDocumentText(input.buffer, input.mimeType);

  const chunks = extractedText
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (chunks.length === 0) {
    return { chunkCount: 0 };
  }

  // Build all embeddings BEFORE touching the database.
  // This way, if embedding fails mid-way, the existing knowledge base is untouched.
  const vectors = await embedTexts(chunks, "passage");
  const rows = chunks.map((chunk, i) => ({
    id: randomUUID(),
    chunk,
    vectorLiteral: `[${vectors[i].join(",")}]`,
  }));

  // All embeddings are ready — now atomically replace (or append) in the DB.
  if (!append) {
    await prisma.$executeRaw`DELETE FROM document_chunk WHERE "businessId" = ${businessId}`;
  }

  for (const { id, chunk, vectorLiteral } of rows) {
    await prisma.$executeRaw`
      INSERT INTO document_chunk (id, "businessId", content, embedding, "createdAt")
      VALUES (${id}::text, ${businessId}::text, ${chunk}::text, ${vectorLiteral}::vector, NOW())
    `;
  }

  return { chunkCount: rows.length };
}
