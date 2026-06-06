import type { NotificationAdminStatus } from "@prisma/client";

export type { NotificationAdminStatus };

export interface NotificationAdminDTO {
  id: string;
  label: string;
  status: NotificationAdminStatus;
  deviceCount: number;
  inviteUrl: string;
  lastAssignedAt: string | null;
  createdAt: string;
}

export interface CreateNotificationAdminRequest {
  label: string;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface RegisterDeviceRequest {
  token: string;
  subscription: PushSubscriptionInput;
  userAgent?: string;
}

export interface RegisterDeviceResponse {
  businessName: string;
}

export interface HandoverAlertPushPayload {
  type: "alert";
  tag: string;
  businessName: string;
  customerPhone: string;
  lastMessage: string;
  claimUrl: string;
}

export interface HandoverRevokePushPayload {
  type: "revoke";
  tag: string;
}

export type HandoverPushPayload =
  | HandoverAlertPushPayload
  | HandoverRevokePushPayload;
