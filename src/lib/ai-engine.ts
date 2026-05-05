import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/utils/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("[ai-engine] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

export interface ChatlyAIResult {
  reply: string;
  intentCategory: string;
  mentionedProduct: string | null;
}

interface BusinessRow {
  name: string;
  description: string | null;
  aiTone: string | null;
}

interface ChunkRow {
  content: string;
}

interface HistoryRow {
  role: "USER" | "AI";
  content: string;
}

export async function runChatlyAIEngine(
  incomingMessage: string,
  incomingPhone: string,
  businessId: string
): Promise<ChatlyAIResult> {
  const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const embedRes = await embeddingModel.embedContent(incomingMessage);
  const queryVector = `[${embedRes.embedding.values.join(",")}]`;

  const chunks = await prisma.$queryRaw<ChunkRow[]>`
    SELECT content
    FROM document_chunk
    WHERE "businessId" = ${businessId}
    ORDER BY embedding <=> ${queryVector}::vector
    LIMIT 3
  `;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, description: true, aiTone: true },
  });

  const recentLogs = await prisma.chatLog.findMany({
    where: { businessId, phone: incomingPhone },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { role: true, content: true },
  });
  const history: HistoryRow[] = recentLogs.reverse();

  const prompt = buildPrompt({
    business,
    chunks,
    history,
    incomingMessage,
  });

  const chatModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await chatModel.generateContent(prompt);
  const raw = result.response.text();

  const parsed = safeParseJson(raw);

  return {
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    intentCategory:
      typeof parsed.intentCategory === "string"
        ? parsed.intentCategory
        : "unknown",
    mentionedProduct:
      typeof parsed.mentionedProduct === "string" && parsed.mentionedProduct
        ? parsed.mentionedProduct
        : null,
  };
}

function buildPrompt({
  business,
  chunks,
  history,
  incomingMessage,
}: {
  business: BusinessRow | null;
  chunks: ChunkRow[];
  history: HistoryRow[];
  incomingMessage: string;
}): string {
  const businessName = business?.name ?? "(unknown)";
  const businessDesc = business?.description ?? "";
  const tone = business?.aiTone ?? "ramah, profesional, dan membantu";

  const knowledgeBlock =
    chunks.length > 0
      ? chunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n\n")
      : "(no knowledge base entries matched)";

  const historyBlock =
    history.length > 0
      ? history
          .map((h) => `${h.role === "USER" ? "Customer" : "Assistant"}: ${h.content}`)
          .join("\n")
      : "(no prior messages)";

  return `[1] ROLE
You are the customer-service AI assistant for the business below. Reply on WhatsApp in the same language the customer used.

[2] BUSINESS
Name: ${businessName}
Description: ${businessDesc}
Preferred tone: ${tone}

[3] KNOWLEDGE BASE (top matches, may be partial)
${knowledgeBlock}

[4] CONVERSATION HISTORY (oldest → newest)
${historyBlock}

[5] CUSTOMER MESSAGE
${incomingMessage}

[6] OUTPUT
Respond with ONE valid JSON object and nothing else. Schema:
{
  "reply": string,            // The reply to send back to the customer.
  "intentCategory": string,   // One short snake_case label, e.g. "price_inquiry", "complaint", "greeting", "product_question", "support_request".
  "mentionedProduct": string | null  // Specific product/service name explicitly referenced in the customer's message, or null.
}
- "reply" must be grounded in the knowledge base when possible. If unknown, say so honestly and offer to escalate.
- Keep "reply" suitable for WhatsApp: concise, no markdown headings.`;
}

function safeParseJson(raw: string): Record<string, unknown> {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return {};
  }
}
