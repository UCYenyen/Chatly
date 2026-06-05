export type ReportFormat = "CSV" | "XLSX";

export interface MonthlyReportSummary {
  totalTransactions: number;
  paidTransactions: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface MonthlyReportRow {
  date: string;
  name: string;
  customerPhone: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
}

export interface MonthlyReportData {
  businessId: string;
  businessName: string;
  period: string;
  periodLabel: string;
  start: Date;
  end: Date;
  rows: MonthlyReportRow[];
  summary: MonthlyReportSummary;
}

export interface ReportFile {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

export interface SendReportResponse {
  sent: boolean;
  email: string;
  period: string;
  rowCount: number;
}
