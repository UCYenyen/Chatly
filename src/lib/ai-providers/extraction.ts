import { PDFParse } from "pdf-parse";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_VISION_MODEL =
  process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const EXTRACTION_PROMPT = `You are extracting a knowledge base for a customer-service AI from the attached document.

Produce rich, descriptive paragraphs that fully describe products, services, policies, FAQs, prices, and any operational details that a customer service agent would need.

Rules:
- Output paragraphs separated by ONE blank line (\\n\\n) — no bullet lists, no headings, no markdown.
- Each paragraph must be self-contained and stand on its own (a customer should be able to understand it without reading the others).
- If a product or service is mentioned, describe it together with its price, variants, and use cases in the same paragraph.
- Preserve the source language; do not translate.
- Do not invent information that is not present in the document.`;

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.pages.map((page) => page.text).join("\n\n");
  } finally {
    await parser.destroy();
  }
}

async function extractFromImage(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const base64 = buffer.toString("base64");

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Groq vision error ${response.status}: ${body.slice(0, 500)}`,
    );
  }

  const data = (await response.json()) as GroqChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq vision returned an empty response");
  }

  return content;
}

export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractFromPdf(buffer);
  }
  if (mimeType.startsWith("image/")) {
    return extractFromImage(buffer, mimeType);
  }
  throw new Error(`Unsupported mime type for extraction: ${mimeType}`);
}
