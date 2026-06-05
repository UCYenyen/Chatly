import type { AISchema, ChatGenerationRequest } from "@/types/ai-provider.md";
import { withRetry } from "./retry";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL ?? "openai/gpt-oss-120b";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

interface JsonSchemaNode {
  type: string | string[];
  description?: string;
  enum?: string[];
  properties?: Record<string, JsonSchemaNode>;
  required?: string[];
  items?: JsonSchemaNode;
  additionalProperties?: boolean;
}

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

function toJsonSchema(schema: AISchema): JsonSchemaNode {
  const type = schema.nullable ? [schema.type, "null"] : schema.type;
  const node: JsonSchemaNode = { type };

  if (schema.description) node.description = schema.description;
  if (schema.enum) node.enum = schema.enum;

  if (schema.properties) {
    node.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      node.properties[key] = toJsonSchema(value);
    }
    node.required = schema.required ?? Object.keys(schema.properties);
    node.additionalProperties = false;
  }

  if (schema.items) node.items = toJsonSchema(schema.items);

  return node;
}

export function isGroqConfigured(): boolean {
  return Boolean(GROQ_API_KEY);
}

export async function generateWithGroq(
  request: ChatGenerationRequest,
): Promise<string> {
  return withRetry(
    async () => {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_CHAT_MODEL,
          temperature: 0.6,
          messages: [
            { role: "system", content: request.systemInstruction },
            { role: "user", content: request.userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: request.schemaName,
              strict: true,
              schema: toJsonSchema(request.responseSchema),
            },
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Groq API error ${response.status}: ${body.slice(0, 500)}`,
        );
      }

      const data = (await response.json()) as GroqChatResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Groq API returned an empty response");
      }

      return content;
    },
    { label: "groq-chat", retries: 1 },
  );
}
