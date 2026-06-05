"use client";

import { useState } from "react";
import type { SendReportResponse } from "@/types/report.md";

export function useSendReport(businessId: string) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNow = async (): Promise<SendReportResponse | null> => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessId}/reports/send`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message ?? "Gagal mengirim laporan");
      }
      return (await res.json()) as SendReportResponse;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { sendNow, isPending, error };
}
