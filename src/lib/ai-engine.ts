import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import prisma from "@/lib/utils/prisma";
import { composeSystemPrompt } from "@/lib/system-prompts/composer";
import { retrieveRelevantChunks } from "@/lib/rag-retrieval";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("[ai-engine] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

/**
 * The structured result returned by the AI engine.
 */
export interface ChatlyAIResult {
  response: string;
  intent_analytics: Record<string, boolean>;
  generate_transaction: {
    name: string;
    description: string;
    amount: number;
  } | null;
  /** True ONLY when the customer explicitly asks to be handed over to a human/admin. */
  escalate_to_human: boolean;
  /** True ONLY when the customer explicitly says they want to end the conversation. */
  end_conversation: boolean;
  /**
   * Whether the AI's `response` should actually be sent to the customer.
   * In HUMAN mode the AI usually stays silent (false) until the customer
   * shows clear intent to talk to the bot again.
   */
  should_respond: boolean;
  /** Conversation mode after this turn. */
  next_mode: "AI" | "HUMAN";
}

interface HistoryRow {
  role: "USER" | "AI";
  content: string;
}

/**
 * Main AI engine function.
 * Composes the system prompt, calls Gemini, and returns structured output.
 */
export async function runChatlyAIEngine(
  incomingMessage: string,
  incomingPhone: string,
  businessId: string,
  currentMode: "AI" | "HUMAN" = "AI",
): Promise<ChatlyAIResult> {
  console.log(`[ai-engine] ====== START ======`);
  console.log(`[ai-engine] message="${incomingMessage}" phone=${incomingPhone} businessId=${businessId}`);

  // 1. Fetch business data + intents in parallel
  console.log("[ai-engine] Step 1: Fetching business + intents from DB...");
  let business, intents;
  try {
    [business, intents] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: {
          name: true,
          description: true,
          aiTone: true,
          knowledgeBase: true,
        },
      }),
      prisma.businessIntent.findMany({
        where: { businessId },
        select: { name: true },
      }),
    ]);
    console.log(`[ai-engine] Step 1 OK: business="${business?.name}", intents=${JSON.stringify(intents.map(i => i.name))}`);
  } catch (err) {
    console.error("[ai-engine] Step 1 FAILED: DB query error:", err);
    return {
      response: "Maaf, sistem kami sedang mengalami gangguan. Silakan coba sesaat lagi.",
      intent_analytics: {},
      generate_transaction: null,
      escalate_to_human: false,
      end_conversation: false,
      should_respond: true,
      next_mode: "AI",
    };
  }

  const intentNames = intents.map((i) => i.name);

  // Build a mapping: sanitized key <-> real intent name
  const keyToIntent: Record<string, string> = {};
  const intentToKey: Record<string, string> = {};
  intentNames.forEach((name, i) => {
    const key = `intent_${i}`;
    keyToIntent[key] = name;
    intentToKey[name] = key;
  });
  console.log(`[ai-engine] Step 2: Key mapping:`, JSON.stringify(keyToIntent));

  // 2a. RAG retrieval — fetch top-K chunks relevant to the incoming message
  console.log("[ai-engine] Step 2.5: Retrieving relevant document chunks...");
  let retrievedChunks: string[] = [];
  try {
    retrievedChunks = await retrieveRelevantChunks(businessId, incomingMessage, 5);
    console.log(`[ai-engine] Step 2.5 OK: retrieved ${retrievedChunks.length} chunks`);
  } catch (err) {
    console.error("[ai-engine] Step 2.5 FAILED (continuing without RAG):", err);
  }

  // 2. Compose the system prompt from modular sections
  console.log("[ai-engine] Step 3: Composing system prompt...");
  let systemInstruction: string;
  try {
    systemInstruction = composeSystemPrompt({
      businessName: business?.name ?? "(unknown)",
      businessDescription: business?.description ?? null,
      aiTone: business?.aiTone ?? null,
      knowledgeBase: business?.knowledgeBase ?? null,
      retrievedChunks,
      intentNames,
      intentKeyMap: intentToKey,
    });
    console.log(`[ai-engine] Step 3 OK: system prompt length = ${systemInstruction.length} chars`);
  } catch (err) {
    console.error("[ai-engine] Step 3 FAILED: Compose error:", err);
    return {
      response: "Maaf, sistem kami sedang mengalami gangguan. Silakan coba sesaat lagi.",
      intent_analytics: {},
      generate_transaction: null,
      escalate_to_human: false,
      end_conversation: false,
      should_respond: true,
      next_mode: "AI",
    };
  }

  // 3. Fetch conversation history (memory)
  console.log("[ai-engine] Step 4: Fetching chat history...");
  let history: HistoryRow[];
  try {
    const recentLogs = await prisma.chatLog.findMany({
      where: { businessId, phone: incomingPhone },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { role: true, content: true },
    });
    history = recentLogs.reverse();
    console.log(`[ai-engine] Step 4 OK: ${history.length} history messages`);
  } catch (err) {
    console.error("[ai-engine] Step 4 FAILED: Chat history error:", err);
    history = [];
  }

  // 4. Build the dynamic intent_analytics schema properties using safe keys
  console.log("[ai-engine] Step 5: Building schema...");
  const intentProperties: Record<string, { type: typeof SchemaType.BOOLEAN; description: string }> = {};
  for (const [key, intentName] of Object.entries(keyToIntent)) {
    intentProperties[key] = {
      type: SchemaType.BOOLEAN,
      description: `Apakah pesan terakhir pelanggan mengindikasikan: "${intentName}"`,
    };
  }

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      response: {
        type: SchemaType.STRING,
        description: "Pesan balasan untuk dikirim ke pelanggan via WhatsApp.",
      },
      intent_analytics: {
        type: SchemaType.OBJECT,
        description: "Evaluasi niat pelanggan berdasarkan pesan terakhir.",
        properties: intentNames.length > 0 ? intentProperties : {
          _empty: {
            type: SchemaType.BOOLEAN,
            description: "Placeholder — tidak ada niat yang dilacak.",
          },
        },
        required: intentNames.length > 0 ? Object.keys(keyToIntent) : [],
      },
      generate_transaction: {
        type: SchemaType.OBJECT,
        nullable: true,
        description: "Isi jika pelanggan ingin membeli/membayar sesuatu. null jika tidak.",
        properties: {
          name: {
            type: SchemaType.STRING,
            description: "Nama item atau layanan yang dibeli.",
          },
          description: {
            type: SchemaType.STRING,
            description: "Deskripsi singkat transaksi.",
          },
          amount: {
            type: SchemaType.NUMBER,
            description: "Harga dalam Rupiah (angka bulat).",
          },
        },
        required: ["name", "description", "amount"],
      },
      escalate_to_human: {
        type: SchemaType.BOOLEAN,
        description:
          `Set true HANYA jika pelanggan secara eksplisit minta dialihkan ke admin/manusia/CS karena masalah yang TIDAK BISA kamu selesaikan sendiri. Contoh true: "tolong sambungkan ke admin", "saya mau bicara dengan orang langsung", "saya tidak puas, mau komplain ke admin", "ini urgent, panggil CS-nya".

JANGAN set true untuk:
- Pelanggan ingin membeli/memesan produk → gunakan generate_transaction, BUKAN escalate. Kamu sepenuhnya mampu memproses pembelian (mis. "saya mau beli produk x", "pesan 10 unit", "checkout dong" → JANGAN escalate, langsung buat transaksi).
- Pelanggan bertanya harga, stok, info produk, jam buka → kamu jawab sendiri.
- Pelanggan menyebut kata "admin" dalam konteks lain (mis. "apakah ada admin di sana?", "siapa adminnya?").
- Keluhan ringan yang masih bisa dijawab dari knowledge base.

Pertimbangkan keseluruhan kalimat dan niat sebenarnya — jangan asal trigger.`,
      },
      end_conversation: {
        type: SchemaType.BOOLEAN,
        description:
          "Set true HANYA jika pelanggan secara eksplisit menyatakan ingin mengakhiri percakapan (mis. 'sudah cukup, terima kasih', 'sampai sini saja', 'selesai'). JANGAN true untuk salam pamit biasa di tengah percakapan ('ok thanks') jika konteks belum tuntas.",
      },
      should_respond: {
        type: SchemaType.BOOLEAN,
        description:
          `Apakah balasanmu (\`response\`) harus dikirim ke pelanggan?
- Mode saat ini: ${currentMode}.
- Jika mode = AI: HAMPIR SELALU true (kamu yang menjawab pelanggan).
- Jika mode = HUMAN: pelanggan sedang ditangani admin manusia. Set false (diam) jika pesan pelanggan masih ditujukan ke admin atau merupakan kelanjutan obrolan dengan admin (mis. balasan, klarifikasi, terima kasih ke admin). Set true HANYA jika pelanggan jelas-jelas mulai topik/pertanyaan baru yang ingin dijawab bot (mis. tanya produk lain, tanya harga, tanya jam buka) — bukan masih nyambung dengan admin.`,
      },
      next_mode: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["AI", "HUMAN"],
        description:
          `Mode percakapan SETELAH giliran ini.
- Jika kamu set escalate_to_human=true, set next_mode="HUMAN".
- Jika mode saat ini HUMAN dan pelanggan sudah jelas balik bertanya ke bot (kamu set should_respond=true), set next_mode="AI".
- Jika mode saat ini HUMAN dan pelanggan masih dengan admin, tetap "HUMAN".
- Jika end_conversation=true, set "AI" (percakapan berikutnya dimulai segar dengan bot).
- Selain itu pertahankan mode saat ini: ${currentMode}.`,
      },
    },
    required: [
      "response",
      "intent_analytics",
      "escalate_to_human",
      "end_conversation",
      "should_respond",
      "next_mode",
    ],
  };

  console.log("[ai-engine] Step 5 OK: Schema built. intent_analytics keys:", Object.keys(intentProperties));

  // 5. Configure Gemini model
  console.log("[ai-engine] Step 6: Creating Gemini model instance...");
  let chatModel;
  try {
    chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      },
    });
    console.log("[ai-engine] Step 6 OK: Model created");
  } catch (err) {
    console.error("[ai-engine] Step 6 FAILED: getGenerativeModel error:", err);
    return {
      response: "Maaf, sistem kami sedang mengalami gangguan. Silakan coba sesaat lagi.",
      intent_analytics: {},
      generate_transaction: null,
      escalate_to_human: false,
      end_conversation: false,
      should_respond: true,
      next_mode: "AI",
    };
  }

  // 6. Build user prompt with conversation history
  const userPrompt = buildUserPrompt(history, incomingMessage);
  console.log("[ai-engine] Step 7: User prompt built, length =", userPrompt.length);

  // 7. Call Gemini
  console.log("[ai-engine] Step 8: Calling Gemini generateContent...");
  try {
    const result = await chatModel.generateContent(userPrompt);
    console.log("[ai-engine] Step 8 OK: Got response from Gemini");

    const raw = result.response.text();
    console.log("[ai-engine] Step 9: Raw response text:", raw);

    const parsed = JSON.parse(raw);
    console.log("[ai-engine] Step 10: Parsed JSON OK:", JSON.stringify(parsed, null, 2));

    // Map sanitized keys back to real intent names
    const intentAnalytics: Record<string, boolean> = {};
    if (parsed.intent_analytics && typeof parsed.intent_analytics === "object") {
      for (const [key, value] of Object.entries(parsed.intent_analytics)) {
        if (key === "_empty") continue;
        const realName = keyToIntent[key];
        if (realName && typeof value === "boolean") {
          intentAnalytics[realName] = value;
        }
      }
    }
    console.log("[ai-engine] Step 11: Mapped intent analytics:", JSON.stringify(intentAnalytics));

    const finalResult: ChatlyAIResult = {
      response: parsed.response || "",
      intent_analytics: intentAnalytics,
      generate_transaction: parsed.generate_transaction ?? null,
      escalate_to_human: parsed.escalate_to_human === true,
      end_conversation: parsed.end_conversation === true,
      should_respond: parsed.should_respond !== false,
      next_mode: parsed.next_mode === "HUMAN" ? "HUMAN" : "AI",
    };
    console.log("[ai-engine] ====== DONE (success) ======");
    return finalResult;
  } catch (error) {
    console.error("[ai-engine] Step 8-10 FAILED: Gemini API Error:", error);
    console.error("[ai-engine] Error name:", (error as any)?.name);
    console.error("[ai-engine] Error message:", (error as any)?.message);
    console.error("[ai-engine] Error stack:", (error as any)?.stack);
    return {
      response: "Maaf, sistem kami sedang mengalami gangguan. Silakan coba sesaat lagi.",
      intent_analytics: {},
      generate_transaction: null,
      escalate_to_human: false,
      end_conversation: false,
      should_respond: true,
      next_mode: "AI",
    };
  }
}

function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/g, "[link pembayaran]").trim();
}

function buildUserPrompt(
  history: HistoryRow[],
  incomingMessage: string
): string {
  const historyBlock =
    history.length > 0
      ? history
          .map((h) => `${h.role === "USER" ? "Pelanggan" : "Asisten"}: ${stripUrls(h.content)}`)
          .join("\n")
      : "(Belum ada riwayat percakapan)";

  return `RIWAYAT PERCAKAPAN:
${historyBlock}

PESAN TERAKHIR PELANGGAN:
${incomingMessage}

Berikan respons JSON sekarang.`;
}
