export interface IgnoredContactDTO {
  id: string;
  phoneNumber: string;
  label: string | null;
  createdAt: string;
}

export interface RecentChatterDTO {
  phoneNumber: string;
  lastMessageAt: string;
  isIgnored: boolean;
}

export interface IgnoreListResponse {
  ignoreList: IgnoredContactDTO[];
}

export interface RecentChattersResponse {
  recentChatters: RecentChatterDTO[];
}

export interface AddIgnoredContactRequest {
  phoneNumber: string;
  label?: string;
}

export interface AddIgnoredContactResponse {
  contact: IgnoredContactDTO;
}

export interface RemoveIgnoredContactRequest {
  phoneNumber?: string;
  id?: string;
}

export interface RemoveIgnoredContactResponse {
  success: boolean;
}
