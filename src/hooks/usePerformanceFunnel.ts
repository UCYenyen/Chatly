import { useEffect, useState } from "react";
import type {
  ConversionRateResponse,
  PerformanceFunnelStage,
} from "@/types/analytics.md";

interface UsePerformanceFunnelResult {
  stages: PerformanceFunnelStage[];
  verdict: string;
  isLoading: boolean;
  error: string | null;
}

const countFormatter = new Intl.NumberFormat("id-ID");

function formatCount(value: number): string {
  return countFormatter.format(value);
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(value / 1_000_000);
    return `Rp ${millions}jt`;
  }
  return `Rp ${countFormatter.format(value)}`;
}

function computeDropOff(current: number, previous: number): number | null {
  if (previous === 0) {
    return null;
  }
  return Math.round((1 - current / previous) * 100);
}

function buildStages(data: ConversionRateResponse): PerformanceFunnelStage[] {
  const chat = data.totalChatCustomers;
  const engaged = data.totalEngagedCustomers;
  const buying = data.totalBuyingCustomers;
  const revenue = data.totalRevenue;

  return [
    {
      key: "mengobrol",
      label: "Mengobrol",
      value: chat,
      format: "count",
      display: formatCount(chat),
      dropOffPercent: null,
      insight: null,
    },
    {
      key: "tertarik",
      label: "Tertarik",
      value: engaged,
      format: "count",
      display: formatCount(engaged),
      dropOffPercent: computeDropOff(engaged, chat),
      insight: null,
    },
    {
      key: "membeli",
      label: "Membeli",
      value: buying,
      format: "count",
      display: formatCount(buying),
      dropOffPercent: computeDropOff(buying, engaged),
      insight: null,
    },
    {
      key: "pendapatan",
      label: "Pendapatan",
      value: revenue,
      format: "currency",
      display: formatCurrency(revenue),
      dropOffPercent: null,
      insight: null,
    },
  ];
}

function buildVerdict(data: ConversionRateResponse): string {
  const chat = formatCount(data.totalChatCustomers);
  const buying = formatCount(data.totalBuyingCustomers);
  const revenue = formatCurrency(data.totalRevenue);

  if (data.totalBuyingCustomers === 0) {
    return `${chat} pelanggan mengobrol, belum ada yang membeli.`;
  }
  if (data.conversionRate >= 10) {
    return `Bot kamu menghasilkan ${revenue} dari ${chat} obrolan.`;
  }
  return `${buying} dari ${chat} pelanggan membeli — masih ada ruang tumbuh.`;
}

export function usePerformanceFunnel(
  businessId: string
): UsePerformanceFunnelResult {
  const [stages, setStages] = useState<PerformanceFunnelStage[]>([]);
  const [verdict, setVerdict] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFunnel = async () => {
      if (!businessId) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/analytics/conversion-rate`
        );
        const responseData: unknown = await res.json();

        if (!res.ok) {
          const message =
            typeof responseData === "object" &&
            responseData !== null &&
            "message" in responseData &&
            typeof responseData.message === "string"
              ? responseData.message
              : "Gagal mengambil data funnel performa";
          throw new Error(message);
        }

        const data = responseData as ConversionRateResponse;
        setStages(buildStages(data));
        setVerdict(buildVerdict(data));
      } catch (err) {
        console.error("[usePerformanceFunnel] Error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunnel();
  }, [businessId]);

  return { stages, verdict, isLoading, error };
}
