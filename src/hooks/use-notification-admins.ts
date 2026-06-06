"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationAdminDTO } from "@/types/notifications.md";

interface UseNotificationAdminsResult {
  admins: NotificationAdminDTO[];
  isLoading: boolean;
  error: string | null;
  addAdmin: (label: string) => Promise<NotificationAdminDTO | null>;
  revokeAdmin: (adminId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotificationAdmins(
  businessId: string | null,
): UseNotificationAdminsResult {
  const [admins, setAdmins] = useState<NotificationAdminDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!businessId) {
      setAdmins([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/businesses/${businessId}/notification-admins`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message ?? "Gagal memuat admin notifikasi");
      }
      setAdmins((await res.json()) as NotificationAdminDTO[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kesalahan tidak diketahui");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const addAdmin = useCallback(
    async (label: string): Promise<NotificationAdminDTO | null> => {
      if (!businessId) return null;
      const res = await fetch(
        `/api/businesses/${businessId}/notification-admins`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ label }),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message ?? "Gagal menambahkan admin notifikasi");
      }
      const created = (await res.json()) as NotificationAdminDTO;
      setAdmins((prev) => [...prev, created]);
      return created;
    },
    [businessId],
  );

  const revokeAdmin = useCallback(
    async (adminId: string): Promise<void> => {
      if (!businessId) return;
      const res = await fetch(
        `/api/businesses/${businessId}/notification-admins/${adminId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message ?? "Gagal mencabut admin notifikasi");
      }
      setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
    },
    [businessId],
  );

  return { admins, isLoading, error, addAdmin, revokeAdmin, refetch };
}
