import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomUUID } from "crypto";
import prisma from "@/lib/utils/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("[rag-ingestion] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

const EXTRACTION_PROMPT = `You are extracting a knowledge base for a customer-service AI from the attached document.

Produce rich, descriptive paragraphs that fully describe products, services, policies, FAQs, prices, and any operational details that a customer service agent would need.

Rules:
- Output paragraphs separated by ONE blank line (\\n\\n) — no bullet lists, no headings, no markdown.
- Each paragraph must be self-contained and stand on its own (a customer should be able to understand it without reading the others).
- If a product or service is mentioned, describe it together with its price, variants, and use cases in the same paragraph.
- Preserve the source language; do not translate.
- Do not invent information that is not present in the document.`;

export interface IngestInput {
  fileUri?: string;
  buffer?: Buffer;
  mimeType: string;
}

export async function processAndSaveKnowledgeBase(
  businessId: string,
  input: IngestInput
): Promise<{ chunkCount: number }> {
  const extractionModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const filePart = input.fileUri
    ? {
        fileData: {
          fileUri: input.fileUri,
          mimeType: input.mimeType,
        },
      }
    : {
        inlineData: {
          data: (input.buffer ?? Buffer.alloc(0)).toString("base64"),
          mimeType: input.mimeType,
        },
      };

  const extractionResult = await extractionModel.generateContent([
    { text: EXTRACTION_PROMPT },
    filePart,
  ]);
  const extractedText = extractionResult.response.text();

  await prisma.$executeRaw`DELETE FROM document_chunk WHERE "businessId" = ${businessId}`;

  const chunks = extractedText
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (chunks.length === 0) {
    return { chunkCount: 0 };
  }

  const embeddingModel = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
  });

  for (const chunk of chunks) {
    const embedRes = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text: chunk }] },
      outputDimensionality: 768,
    } as unknown as Parameters<typeof embeddingModel.embedContent>[0]);
    const vector = embedRes.embedding.values;
    const vectorLiteral = `[${vector.join(",")}]`;
    const id = randomUUID();

    await prisma.$executeRaw`
      INSERT INTO document_chunk (id, "businessId", content, embedding, "createdAt")
      VALUES (${id}::text, ${businessId}::text, ${chunk}::text, ${vectorLiteral}::vector, NOW())
    `;
  }

  return { chunkCount: chunks.length };
}
