export type AIProvider = "gemini" | "groq";

export type EmbeddingProvider = "jina" | "gemini";

export type EmbeddingTask = "query" | "passage";

export type AISchemaType =
  | "object"
  | "string"
  | "boolean"
  | "number"
  | "integer"
  | "array";

export interface AISchema {
  type: AISchemaType;
  description?: string;
  nullable?: boolean;
  enum?: string[];
  properties?: Record<string, AISchema>;
  required?: string[];
  items?: AISchema;
}

export interface ChatGenerationRequest {
  systemInstruction: string;
  userPrompt: string;
  schemaName: string;
  responseSchema: AISchema;
}

export interface ChatGenerationResult {
  rawText: string;
  provider: AIProvider;
}
