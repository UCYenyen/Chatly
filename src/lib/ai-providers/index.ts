import type {
  AIProvider,
  ChatGenerationRequest,
  ChatGenerationResult,
} from "@/types/ai-provider.md";
import { generateWithGemini, isGeminiConfigured } from "./gemini";
import { generateWithGroq, isGroqConfigured } from "./groq";

function resolvePrimaryProvider(): AIProvider {
  return process.env.AI_PROVIDER?.toLowerCase() === "groq" ? "groq" : "gemini";
}

function buildProviderOrder(): AIProvider[] {
  const primary = resolvePrimaryProvider();
  const fallback: AIProvider = primary === "groq" ? "gemini" : "groq";
  return [primary, fallback];
}

function isProviderConfigured(provider: AIProvider): boolean {
  return provider === "groq" ? isGroqConfigured() : isGeminiConfigured();
}

async function runProvider(
  provider: AIProvider,
  request: ChatGenerationRequest,
): Promise<string> {
  return provider === "groq"
    ? generateWithGroq(request)
    : generateWithGemini(request);
}

export async function generateChatCompletion(
  request: ChatGenerationRequest,
): Promise<ChatGenerationResult> {
  const order = buildProviderOrder().filter(isProviderConfigured);

  if (order.length === 0) {
    throw new Error(
      "No AI provider is configured. Set GEMINI_API_KEY and/or GROQ_API_KEY.",
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
