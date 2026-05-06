/**
 * Prompt Composer
 *
 * Composes all system prompt sections into a single system instruction string.
 */

import { ADMIN_PROMPT } from "./admin";
import { getPersonalityPrompt } from "./personalities";
import { buildTrainingPrompt } from "./training";
import { buildIntentPrompt } from "./intents";

export interface ComposerInput {
  businessName: string;
  businessDescription: string | null;
  aiTone: string | null;
  knowledgeBase: string | null;
  /** Top-K chunks retrieved from vector store relevant to the current message. */
  retrievedChunks?: string[];
  intentNames: string[];
  /** Mapping from real intent name → sanitized key (e.g. "intent_0") */
  intentKeyMap: Record<string, string>;
}

export function composeSystemPrompt(input: ComposerInput): string {
  const sections: string[] = [];

  // 1. Admin prompt (base rules)
  sections.push(ADMIN_PROMPT);

  // 2. Business context
  sections.push(`KONTEKS BISNIS:
Nama Bisnis: "${input.businessName}"
Deskripsi: ${input.businessDescription || "(Tidak ada deskripsi)"}`);

  // 3. Personality prompt
  sections.push(getPersonalityPrompt(input.aiTone));

  // 4. Training / Knowledge Base
  sections.push(buildTrainingPrompt(input.knowledgeBase, input.retrievedChunks));

  // 5. Intent analytics
  sections.push(buildIntentPrompt(input.intentNames, input.intentKeyMap));

  return sections.join("\n\n---\n\n");
}
