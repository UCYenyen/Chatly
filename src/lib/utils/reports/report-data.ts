import prisma from "@/lib/utils/prisma";
import type {
  MonthlyReportData,
  MonthlyReportRow,
  MonthlyReportSummary,
} from "@/types/report.md";

const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DEFAULT_TIMEZONE = "Asia/Jakarta";

function timezoneOffsetMs(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const map: Record<string, number> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = Number(part.value);
  }
  const asUtc = Date.UTC(
    map.year, map.month - 1, map.day,
    map.hour === 24 ? 0 : map.hour, map.minute, map.second,
  );
  return asUtc - date.getTime();
}

function zonedMonthStart(timeZone: string, year: number, month: number): Date {
  const naive = Date.UTC(year, month - 1, 1, 0, 0, 0);
  const offset = timezoneOffsetMs(timeZone, new Date(naive));
  return new Date(naive - offset);
}

export function computeMonthBoundaries(
  timeZone: string,
  year: number,
  month: number,
): { start: Date; end: Date } {
  const start = zonedMonthStart(timeZone, year, month);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = zonedMonthStart(timeZone, nextYear, nextMonth);
  return { start, end };
}

export function formatPeriodLabel(year: number, month: number): string {
  return `${INDONESIAN_MONTHS[month - 1]} ${year}`;
}

export async function getMonthlyReportData(
  businessId: string,
  year: number,
  month: number,
): Promise<MonthlyReportData> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, timezone: true },
  });
  if (!business) throw new Error(`Business ${businessId} not found`);

  const timeZone = business.timezone ?? DEFAULT_TIMEZONE;
  const { start, end } = computeMonthBoundaries(timeZone, year, month);

  const transactions = await prisma.customerTransaction.findMany({
    where: { businessId, createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
  });

  const rows: MonthlyReportRow[] = transactions.map((t) => ({
    date: t.createdAt.toISOString(),
    name: t.name,
    customerPhone: t.customerPhone,
    description: t.description ?? "",
    amount: t.amount,
    currency: t.currency,
    status: t.status,
  }));

  const paid = transactions.filter((t) => t.status === "PAID");
  const totalRevenue = paid.reduce((sum, t) => sum + t.amount, 0);
  const summary: MonthlyReportSummary = {
    totalTransactions: transactions.length,
    paidTransactions: paid.length,
    totalRevenue,
    conversionRate:
      transactions.length > 0 ? (paid.length / transactions.length) * 100 : 0,
  };

  return {
    businessId,
    businessName: business.name,
    period: `${year}-${String(month).padStart(2, "0")}`,
    periodLabel: formatPeriodLabel(year, month),
    start,
    end,
    rows,
    summary,
  };
}
