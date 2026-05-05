import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, description: true, aiTone: true },
  });

  const embeddingModel = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
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

  const recentLogs = await prisma.chatLog.findMany({
    where: { businessId, phone: incomingPhone },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { role: true, content: true },
  });
  const history: HistoryRow[] = recentLogs.reverse();

  // Unified System Instruction for persona and constraints
  const systemInstruction = buildSystemInstruction(business);

  const chatModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          reply: {
            type: SchemaType.STRING,
            description: "The helpful response to send to the customer on WhatsApp.",
          },
          intentCategory: {
            type: SchemaType.STRING,
            description: "A short snake_case label representing the user's intent.",
          },
          mentionedProduct: {
            type: SchemaType.STRING,
            nullable: true,
            description: "Specific product name explicitly mentioned by the customer.",
          },
        },
        required: ["reply", "intentCategory"],
      },
    },
  });

  const userPrompt = buildUserPrompt(chunks, history, incomingMessage);

  console.log(`[ai-engine] Querying Gemini for business: ${business?.name || "unknown"}`);
  
  try {
    const result = await chatModel.generateContent(userPrompt);
    const raw = result.response.text();
    const parsed = JSON.parse(raw);

    return {
      reply: parsed.reply || "",
      intentCategory: parsed.intentCategory || "unknown",
      mentionedProduct: parsed.mentionedProduct || null,
    };
  } catch (error) {
    console.error("[ai-engine] Gemini API Error:", error);
    return {
      reply: "Maaf, sistem kami sedang mengalami gangguan. Silakan coba sesaat lagi.",
      intentCategory: "error",
      mentionedProduct: null,
    };
  }
}

function buildSystemInstruction(business: BusinessRow | null): string {
  const businessName = business?.name ?? "(unknown)";
  const businessDesc = business?.description ?? "";
  const tone = business?.aiTone ?? "ramah, profesional, dan membantu";

  return `You are the customer-service AI assistant for the business: "${businessName}".
Business Description: ${businessDesc}
Preferred Tone: ${tone}

RULES:
1. Reply on WhatsApp in the same language the customer uses (usually Indonesian).
2. Ground your "reply" in the provided Knowledge Base. 
3. If the answer isn't in the Knowledge Base, honestly say you don't know and offer to connect them with a human agent.
4. Keep replies concise and suitable for WhatsApp (no markdown headings, use emoji sparingly).
5. Always return a valid JSON object.`;
}

function buildUserPrompt(
  chunks: ChunkRow[],
  history: HistoryRow[],
  incomingMessage: string
): string {
  const knowledgeBlock =
    chunks.length > 0
      ? chunks.map((c, i) => `[Fact ${i + 1}] ${c.content}`).join("\n")
      : "(No matching facts found in Knowledge Base)";

  const historyBlock =
    history.length > 0
      ? history
          .map((h) => `${h.role === "USER" ? "Customer" : "Assistant"}: ${h.content}`)
          .join("\n")
      : "(No prior history)";

  return `KNOWLEDGE BASE (Context):
${knowledgeBlock}

CONVERSATION HISTORY:
${historyBlock}

CUSTOMER'S LATEST MESSAGE:
${incomingMessage}

Provide your JSON response now.`;
}
