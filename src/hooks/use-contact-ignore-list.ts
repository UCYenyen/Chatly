"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  IgnoredContactDTO,
  RecentChatterDTO,
  IgnoreListResponse,
  RecentChattersResponse,
} from "@/types/ignore-list.md";

interface UseContactIgnoreListResult {
  ignoreList: IgnoredContactDTO[];
  recentChatters: RecentChatterDTO[];
  isLoading: boolean;
  error: string | null;
  addContact: (phoneNumber: string, label?: string) => Promise<void>;
  removeContact: (phoneNumber: string) => Promise<void>;
  refetch: () => Promise<void>;
}

async function parseJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const raw = await res.text();
  const data = raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
  if (!res.ok) {
    throw new Error(data.error || `${fallbackMessage} (HTTP ${res.status})`);
  }
  return data;
}

export function useContactIgnoreList(
  businessId: string
): UseContactIgnoreListResult {
  const [ignoreList, setIgnoreList] = useState<IgnoredContactDTO[]>([]);
  const [recentChatters, setRecentChatters] = useState<RecentChatterDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ignoreRes, chattersRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}/whatsapp/ignore-list`, {
          credentials: "include",
        }),
        fetch(`/api/businesses/${businessId}/whatsapp/recent-chatters`, {
          credentials: "include",
        }),
      ]);

      const ignoreData = await parseJsonResponse<IgnoreListResponse>(
        ignoreRes,
        "Gagal memuat daftar abaikan"
      );
      const chattersData = await parseJsonResponse<RecentChattersResponse>(
        chattersRes,
        "Gagal memuat kontak terbaru"
      );
      setIgnoreList(ignoreData.ignoreList ?? []);
      setRecentChatters(chattersData.recentChatters ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const addContact = useCallback(
    async (phoneNumber: string, label?: string) => {
      const res = await fetch(
        `/api/businesses/${businessId}/whatsapp/ignore-list`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, label }),
          credentials: "include",
        }
      );
      await parseJsonResponse(res, "Gagal menambahkan kontak");
      await fetchAll();
    },
    [businessId, fetchAll]
  );

  const removeContact = useCallback(
    async (phoneNumber: string) => {
      const res = await fetch(
        `/api/businesses/${businessId}/whatsapp/ignore-list`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
          credentials: "include",
        }
      );
      await parseJsonResponse(res, "Gagal menghapus kontak");
      await fetchAll();
    },
    [businessId, fetchAll]
  );

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    ignoreList,
    recentChatters,
    isLoading,
    error,
    addContact,
    removeContact,
    refetch: fetchAll,
  };
}
