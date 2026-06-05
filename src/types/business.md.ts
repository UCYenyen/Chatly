import type { WeeklyHours } from "@/types/business-hours.md";

export interface BusinessDTO {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeBase: string | null;
  aiTone: string | null;
  knowledgeFiles: string[];
  handoverHoursEnabled: boolean;
  timezone: string | null;
  businessHours: WeeklyHours | null;
  notificationPhone: string | null;
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
}

export interface UpdateBusinessRequest {
  name?: string;
  description?: string | null;
  knowledgeBase?: string | null;
  aiTone?: string | null;
  knowledgeFiles?: string[];
  handoverHoursEnabled?: boolean;
  timezone?: string | null;
  businessHours?: WeeklyHours | null;
  notificationPhone?: string | null;
}

export interface BusinessListResponse {
  businesses: BusinessDTO[];
}
