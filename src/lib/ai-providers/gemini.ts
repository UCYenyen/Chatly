import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import type { AISchema, ChatGenerationRequest } from "@/types/ai-provider.md";
import { withRetry } from "./retry";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-2.5-flash-lite";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY ?? "");

const SCHEMA_TYPE_MAP: Record<AISchema["type"], SchemaType> = {
  object: SchemaType.OBJECT,
  string: SchemaType.STRING,
  boolean: SchemaType.BOOLEAN,
  number: SchemaType.NUMBER,
  integer: SchemaType.INTEGER,
  array: SchemaType.ARRAY,
};

interface GeminiSchemaNode {
  type: SchemaType;
  description?: string;
  nullable?: boolean;
  format?: string;
  enum?: string[];
  properties?: Record<string, GeminiSchemaNode>;
  required?: string[];
  items?: GeminiSchemaNode;
}

function toGeminiSchema(schema: AISchema): GeminiSchemaNode {
  const node: GeminiSchemaNode = { type: SCHEMA_TYPE_MAP[schema.type] };

  if (schema.description) node.description = schema.description;
  if (schema.nullable) node.nullable = true;
  if (schema.enum) {
    node.format = "enum";
    node.enum = schema.enum;
  }
  if (schema.properties) {
    node.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      node.properties[key] = toGeminiSchema(value);
    }
  }
  if (schema.required) node.required = schema.required;
  if (schema.items) node.items = toGeminiSchema(schema.items);

  return node;
}

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY);
}

export async function generateWithGemini(
  request: ChatGenerationRequest,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: GEMINI_CHAT_MODEL,
    systemInstruction: request.systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: toGeminiSchema(request.responseSchema) as unknown as Schema,
    },
  });

  return withRetry(
    async () => {
      const result = await model.generateContent(request.userPrompt);
      return result.response.text();
    },
    { label: "gemini-chat", retries: 1 },
  );
}
