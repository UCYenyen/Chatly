import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EmbeddingProvider, EmbeddingTask } from "@/types/ai-provider.md";
import { withRetry } from "./retry";

const EMBEDDING_DIMENSIONS = 768;
const JINA_MAX_BATCH = 64;

const JINA_API_KEY = process.env.JINA_API_KEY;
const JINA_EMBEDDING_MODEL = process.env.JINA_EMBEDDING_MODEL ?? "jina-embeddings-v3";
const JINA_ENDPOINT = "https://api.jina.ai/v1/embeddings";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

interface JinaEmbeddingResponse {
  data?: Array<{ index?: number; embedding?: number[] }>;
}

export function resolveEmbeddingProvider(): EmbeddingProvider {
  return process.env.EMBEDDING_PROVIDER?.toLowerCase() === "gemini"
    ? "gemini"
    : "jina";
}

async function jinaEmbedBatch(
  texts: string[],
  task: EmbeddingTask,
): Promise<number[][]> {
  if (!JINA_API_KEY) {
    throw new Error("JINA_API_KEY is not set");
  }

  const response = await fetch(JINA_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JINA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: JINA_EMBEDDING_MODEL,
      task: task === "query" ? "retrieval.query" : "retrieval.passage",
      dimensions: EMBEDDING_DIMENSIONS,
      input: texts,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jina API error ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = (await response.json()) as JinaEmbeddingResponse;
  const items = data.data;

  if (!items || items.length !== texts.length) {
    throw new Error("Jina API returned an unexpected number of embeddings");
  }

  const ordered: number[][] = new Array(texts.length);
  items.forEach((item, position) => {
    const index = typeof item.index === "number" ? item.index : position;
    if (!item.embedding || item.embedding.length === 0) {
      throw new Error("Jina API returned an empty embedding");
    }
    ordered[index] = item.embedding;
  });

  return ordered;
}

async function geminiEmbedOne(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  } as unknown as Parameters<typeof model.embedContent>[0]);

  return result.embedding.values;
}

export async function embedText(
  text: string,
  task: EmbeddingTask,
): Promise<number[]> {
  if (resolveEmbeddingProvider() === "gemini") {
    return withRetry(() => geminiEmbedOne(text), { label: "gemini-embed", retries: 3 });
  }
  const [vector] = await withRetry(() => jinaEmbedBatch([text], task), {
    label: "jina-embed",
    retries: 3,
  });
  return vector;
}

export async function embedTexts(
  texts: string[],
  task: EmbeddingTask,
): Promise<number[][]> {
  if (texts.length === 0) return [];

  if (resolveEmbeddingProvider() === "gemini") {
    const vectors: number[][] = [];
    for (const text of texts) {
      vectors.push(
        await withRetry(() => geminiEmbedOne(text), {
          label: "gemini-embed",
          retries: 3,
        }),
      );
    }
    return vectors;
  }

  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += JINA_MAX_BATCH) {
    const batch = texts.slice(i, i + JINA_MAX_BATCH);
    const batchVectors = await withRetry(() => jinaEmbedBatch(batch, task), {
      label: "jina-embed",
      retries: 3,
    });
    vectors.push(...batchVectors);
  }
  return vectors;
}
