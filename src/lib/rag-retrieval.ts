import prisma from "@/lib/utils/prisma";
import { embedText } from "@/lib/ai-providers/embeddings";

interface ChunkRow {
  content: string;
  distance: number;
}

export async function retrieveRelevantChunks(
  businessId: string,
  query: string,
  topK = 5,
): Promise<string[]> {
  if (!query.trim()) return [];

  try {
    const vector = await embedText(query, "query");
    const vectorLiteral = `[${vector.join(",")}]`;

    const rows = await prisma.$queryRaw<ChunkRow[]>`
      SELECT content, (embedding <=> ${vectorLiteral}::vector) AS distance
      FROM document_chunk
      WHERE "businessId" = ${businessId}
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;

    return rows.map((r) => r.content);
  } catch (err) {
    console.error("[rag-retrieval] retrieval failed:", err);
    return [];
  }
}
