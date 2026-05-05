export type MessageRole = "user" | "ai";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string | React.ReactNode;
  timestamp: Date;
  status?: "sending" | "sent" | "received";
}

export interface SimulationStep {
  role: MessageRole;
  content: string | React.ReactNode;
  delay: number;
}
