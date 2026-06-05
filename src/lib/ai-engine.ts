import prisma from "@/lib/utils/prisma";
import { composeSystemPrompt } from "@/lib/system-prompts/composer";
import { retrieveRelevantChunks } from "@/lib/rag-retrieval";
import { generateChatCompletion } from "@/lib/ai-providers";
import type { AISchema } from "@/types/ai-provider.md";
import type { BusinessHoursStatus } from "@/types/business-hours.md";

function buildClosedHandoverPrompt(status: BusinessHoursStatus): string {
  const returnLabel = status.nextOpenLabel ?? "pada jam operasional berikutnya";
  return `STATUS LAYANAN ADMIN: TUTUP.
Saat ini di luar jam operasional bisnis, sehingga admin manusia TIDAK tersedia.
Jika pelanggan meminta berbicara dengan admin/manusia/CS:
- JANGAN set escalate_to_human=true.
- JANGAN set next_mode="HUMAN".
- Minta maaf dengan sopan, jelaskan bahwa admin sedang tidak tersedia di luar jam operasional, dan beri tahu bahwa admin akan tersedia kembali ${returnLabel}.
Tetap bantu pelanggan semampumu dalam mode AI menggunakan informasi yang kamu miliki.`;
}

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

interface ParsedAIResponse {
  response?: unknown;
  intent_analytics?: Record<string, unknown>;
  generate_transaction?: ChatlyAIResult["generate_transaction"];
  escalate_to_human?: unknown;
  end_conversation?: unknown;
  should_respond?: unknown;
  next_mode?: unknown;
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
  hoursStatus?: BusinessHoursStatus,
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
    if (retrievedChunks.length === 0) {
      console.warn(
        "[ai-engine] Step 2.5 WARNING: No knowledge chunks found for businessId=" + businessId +
        " message='" + incomingMessage.slice(0, 50) + "...' — " +
        "Customer will receive generic AI response without knowledge augmentation. " +
        "Check if business has uploaded knowledge documents."
      );
    } else {
      console.log(`[ai-engine] Step 2.5 OK: retrieved ${retrievedChunks.length}/5 chunks`);
    }
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
    if (hoursStatus && !hoursStatus.isOpen) {
      systemInstruction += `\n\n---\n\n${buildClosedHandoverPrompt(hoursStatus)}`;
      console.log("[ai-engine] Business closed — injected off-hours handover guard into prompt.");
    }
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

  // 3. Fetch conversation history (memory).
  // We exclude the most recently saved USER message (the one we just stored in the
  // webhook handler) because it is passed separately as `incomingMessage` below.
  // Fetching it here too would cause it to appear twice in the prompt.
  console.log("[ai-engine] Step 4: Fetching chat history...");
  let history: HistoryRow[];
  try {
    const recentLogs = await prisma.chatLog.findMany({
      where: {
        businessId,
        phone: incomingPhone,
        NOT: { role: "USER", content: incomingMessage },
      },
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
  const intentProperties: Record<string, AISchema> = {};
  for (const [key, intentName] of Object.entries(keyToIntent)) {
    intentProperties[key] = {
      type: "boolean",
      description: `Apakah pesan terakhir pelanggan mengindikasikan minat terhadap "${intentName}" (explicit atau implicit: tanya harga, fitur, cara kerja, ketersediaan, proses order, dll)?`,
    };
  }

  const responseSchema: AISchema = {
    type: "object",
    properties: {
      response: {
        type: "string",
        description: "Pesan balasan untuk dikirim ke pelanggan via WhatsApp.",
      },
      intent_analytics: {
        type: "object",
        description: "Evaluasi niat pelanggan berdasarkan pesan terakhir. PENTING: Deteksi implicit intent juga (misal: bertanya tentang produk = minat produk, tanya harga = minat beli), bukan hanya explicit statement.",
        properties: intentNames.length > 0 ? intentProperties : {
          _empty: {
            type: "boolean",
            description: "Placeholder — tidak ada niat yang dilacak.",
          },
        },
        required: intentNames.length > 0 ? Object.keys(keyToIntent) : ["_empty"],
      },
      generate_transaction: {
        type: "object",
        nullable: true,
        description: "Isi jika pelanggan ingin membeli/membayar sesuatu. null jika tidak.",
        properties: {
          name: {
            type: "string",
            description: "Nama item atau layanan yang dibeli.",
          },
          description: {
            type: "string",
            description: "Deskripsi singkat transaksi.",
          },
          amount: {
            type: "number",
            description: "Harga dalam Rupiah (angka bulat).",
          },
        },
        required: ["name", "description", "amount"],
      },
      escalate_to_human: {
        type: "boolean",
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
        type: "boolean",
        description:
          "Set true HANYA jika pelanggan secara eksplisit menyatakan ingin mengakhiri percakapan (mis. 'sudah cukup, terima kasih', 'sampai sini saja', 'selesai'). JANGAN true untuk salam pamit biasa di tengah percakapan ('ok thanks') jika konteks belum tuntas.",
      },
      should_respond: {
        type: "boolean",
        description:
          `Apakah balasanmu (\`response\`) harus dikirim ke pelanggan?
- Mode saat ini: ${currentMode}.
- Jika mode = AI: HAMPIR SELALU true (kamu yang menjawab pelanggan).
- Jika mode = HUMAN: pelanggan sedang ditangani admin manusia. Set false (diam) jika pesan pelanggan masih ditujukan ke admin atau merupakan kelanjutan obrolan dengan admin (mis. balasan, klarifikasi, terima kasih ke admin). Set true HANYA jika pelanggan jelas-jelas mulai topik/pertanyaan baru yang ingin dijawab bot (mis. tanya produk lain, tanya harga, tanya jam buka) — bukan masih nyambung dengan admin.`,
      },
      next_mode: {
        type: "string",
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
      "generate_transaction",
      "escalate_to_human",
      "end_conversation",
      "should_respond",
      "next_mode",
    ],
  };

  console.log("[ai-engine] Step 5 OK: Schema built. intent_analytics keys:", Object.keys(intentProperties));

  const userPrompt = buildUserPrompt(history, incomingMessage);
  console.log("[ai-engine] Step 6: User prompt built, length =", userPrompt.length);

  console.log("[ai-engine] Step 7: Calling AI provider...");
  try {
    const { rawText, provider } = await generateChatCompletion({
      systemInstruction,
      userPrompt,
      schemaName: "chatly_response",
      responseSchema,
    });
    console.log(`[ai-engine] Step 7 OK: response from provider="${provider}"`);
    console.log("[ai-engine] Step 8: Raw response text:", rawText);

    const parsed = JSON.parse(rawText) as ParsedAIResponse;
    console.log("[ai-engine] Step 9: Parsed JSON OK:", JSON.stringify(parsed, null, 2));

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
    console.log("[ai-engine] Step 10: Mapped intent analytics:", JSON.stringify(intentAnalytics));

    const finalResult: ChatlyAIResult = {
      response: typeof parsed.response === "string" ? parsed.response : "",
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
    console.error("[ai-engine] Step 7-9 FAILED: AI provider error:", error);
    console.error(
      "[ai-engine] Error message:",
      error instanceof Error ? error.message : String(error),
    );
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
