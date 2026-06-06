export type WhatsAppAuthType = "OFFICIAL" | "GOWA";
export type WhatsAppAuthStatus =
  | "PENDING"
  | "AUTHENTICATED"
  | "EXPIRED"
  | "DISCONNECTED";

export interface WhatsAppAuthDTO {
  id: string;
  businessId: string;
  authType: WhatsAppAuthType;
  status: WhatsAppAuthStatus;
  phoneNumber: string | null;
  qrCode: string | null;
  qrCodeExpiry: string | null;
  instanceKey: string | null;
  lastConnected: string | null;
  disconnectedAt: string | null;
}

export interface InitWhatsAppAuthResponse {
  qrCode: string;
  qrCodeExpiry: string;
  deviceId: string;
  channelId: string;
  message: string;
}

export interface WhatsAppStatusResponse {
  channels: WhatsAppAuthDTO[];
}

export interface WhatsAppLogoutResponse {
  success: boolean;
  message: string;
}

export interface GowaWebhookPayload {
  event: string;
  data: Record<string, unknown>;
}
