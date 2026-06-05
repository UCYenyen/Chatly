"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  IgnoredContactDTO,
  RecentChatterDTO,
  WhatsAppContactDTO,
  IgnoreListResponse,
  RecentChattersResponse,
  WhatsAppContactsResponse,
} from "@/types/ignore-list.md";

interface UseContactIgnoreListResult {
  ignoreList: IgnoredContactDTO[];
  ignoreAll: boolean;
  setIgnoreAll: (enabled: boolean) => Promise<void>;
  recentChatters: RecentChatterDTO[];
  contacts: WhatsAppContactDTO[];
  isContactsLoading: boolean;
  contactsError: string | null;
  loadContacts: () => Promise<void>;
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
  const [ignoreAll, setIgnoreAllState] = useState(false);
  const [recentChatters, setRecentChatters] = useState<RecentChatterDTO[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContactDTO[]>([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const contactsLoadedRef = useRef(false);
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
      setIgnoreAllState(ignoreData.ignoreAll ?? false);
      setRecentChatters(chattersData.recentChatters ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const loadContacts = useCallback(async () => {
    if (contactsLoadedRef.current || isContactsLoading) return;
    setIsContactsLoading(true);
    setContactsError(null);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/whatsapp/contacts`,
        { credentials: "include" }
      );
      const data = await parseJsonResponse<WhatsAppContactsResponse>(
        res,
        "Gagal memuat kontak WhatsApp"
      );
      setContacts(data.contacts ?? []);
      contactsLoadedRef.current = true;
    } catch (err) {
      setContactsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsContactsLoading(false);
    }
  }, [businessId, isContactsLoading]);

  const setIgnoreAll = useCallback(
    async (enabled: boolean) => {
      setIgnoreAllState(enabled);
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/whatsapp/ignore-list`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ignoreAll: enabled }),
            credentials: "include",
          }
        );
        await parseJsonResponse(res, "Gagal memperbarui pengaturan");
      } catch (err) {
        setIgnoreAllState(!enabled);
        throw err;
      }
    },
    [businessId]
  );

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
    ignoreAll,
    setIgnoreAll,
    recentChatters,
    contacts,
    isContactsLoading,
    contactsError,
    loadContacts,
    isLoading,
    error,
    addContact,
    removeContact,
    refetch: fetchAll,
  };
}
