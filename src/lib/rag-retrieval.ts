import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/utils/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

interface ChunkRow {
  content: string;
  distance: number;
}

/**
 * Retrieve the top-K most similar document chunks for a business given a
 * natural-language query. Uses pgvector cosine distance (`<=>`).
 */
export async function retrieveRelevantChunks(
  businessId: string,
  query: string,
  topK = 5,
): Promise<string[]> {
  if (!GEMINI_API_KEY || !query.trim()) return [];

  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embedRes = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text: query }] },
      outputDimensionality: 768,
    } as unknown as Parameters<typeof embeddingModel.embedContent>[0]);
    const vector = embedRes.embedding.values;
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
