export interface BusinessDTO {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeBase: string | null;
  aiTone: string | null;
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
}

export interface BusinessListResponse {
  businesses: BusinessDTO[];
}
