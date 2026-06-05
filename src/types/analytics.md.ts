export interface ConversionTransaction {
  id: string;
  customerPhone: string;
  name: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface ConversionRateResponse {
  totalChatCustomers: number;
  totalEngagedCustomers: number;
  totalBuyingCustomers: number;
  conversionRate: number;
  totalTransactions: number;
  totalRevenue: number;
  conversionSummary: {
    label: string;
    value: string;
    description: string;
  };
  details: {
    chatCustomers: string[];
    buyingCustomers: string[];
    transactions: ConversionTransaction[];
  };
}

export type PerformanceFunnelFormat = "count" | "currency";

export interface PerformanceFunnelStage {
  key: string;
  label: string;
  value: number;
  format: PerformanceFunnelFormat;
  display: string;
  dropOffPercent: number | null;
  insight: string | null;
}
