import type { HandoverStatus, HandoverResolver } from "@prisma/client";

export type { HandoverStatus, HandoverResolver };

export interface HandoverNotificationContext {
  businessName: string;
  customerPhone: string;
  lastMessage: string;
  instanceKey: string;
  notificationPhone: string | null;
  resolveToken: string;
}

export interface ResolveResult {
  status: "resolved" | "already_handled" | "not_found";
  customerPhone: string | null;
}
