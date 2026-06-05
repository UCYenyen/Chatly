import type {
  AIProvider,
  ChatGenerationRequest,
  ChatGenerationResult,
} from "@/types/ai-provider.md";
import { generateWithGemini, isGeminiConfigured } from "./gemini";
import { generateWithGroq, isGroqConfigured } from "./groq";
import { generateWithDeepSeek, isDeepSeekConfigured } from "./deepseek";

function resolvePrimaryProvider(): AIProvider {
  const env = process.env.AI_PROVIDER?.toLowerCase();
  if (env === "groq") return "groq";
  if (env === "deepseek") return "deepseek";
  return "gemini";
}

function buildProviderOrder(): AIProvider[] {
  const primary = resolvePrimaryProvider();
  const all: AIProvider[] = ["gemini", "groq", "deepseek"];
  return [primary, ...all.filter((p) => p !== primary)];
}

function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case "groq":
      return isGroqConfigured();
    case "deepseek":
      return isDeepSeekConfigured();
    default:
      return isGeminiConfigured();
  }
}

async function runProvider(
  provider: AIProvider,
  request: ChatGenerationRequest,
): Promise<string> {
  switch (provider) {
    case "groq":
      return generateWithGroq(request);
    case "deepseek":
      return generateWithDeepSeek(request);
    default:
      return generateWithGemini(request);
  }
}

export async function generateChatCompletion(
  request: ChatGenerationRequest,
): Promise<ChatGenerationResult> {
  const order = buildProviderOrder().filter(isProviderConfigured);

  if (order.length === 0) {
    throw new Error(
      "No AI provider is configured. Set GEMINI_API_KEY, GROQ_API_KEY, and/or DEEPSEEK_API_KEY.",
    );
  }

  let lastError: unknown = null;

  for (const provider of order) {
    try {
      const rawText = await runProvider(provider, request);
      console.log(`[ai-provider] Generated with provider="${provider}"`);
      return { rawText, provider };
    } catch (error) {
      lastError = error;
      console.error(
        `[ai-provider] Provider "${provider}" failed; trying next if available.`,
        error,
      );
    }
  }

  throw lastError ?? new Error("All AI providers failed");
}
