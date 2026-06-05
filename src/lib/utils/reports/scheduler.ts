import cron from "node-cron";
import prisma from "@/lib/utils/prisma";
import type {
  MonthlyReportData,
  ReportFile,
  ReportFormat,
} from "@/types/report.md";
import { getMonthlyReportData } from "./report-data";
import { buildReportFile } from "./report-file";
import { sendMonthlyReport } from "./report-mailer";

export type SendReportFn = (
  email: string,
  data: MonthlyReportData,
  file: ReportFile,
) => Promise<void>;

export function previousMonth(now: Date): {
  year: number;
  month: number;
  period: string;
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return {
    year: prevYear,
    month: prevMonth,
    period: `${prevYear}-${String(prevMonth).padStart(2, "0")}`,
  };
}

export async function runReportForBusiness(options: {
  businessId: string;
  year: number;
  month: number;
  format: ReportFormat;
  email: string;
  deleteAfterSend: boolean;
  send?: SendReportFn;
}): Promise<{ rowCount: number; period: string }> {
  const data = await getMonthlyReportData(
    options.businessId,
    options.year,
    options.month,
  );
  const file = await buildReportFile(data, options.format);
  const send = options.send ?? sendMonthlyReport;

  // Email MUST succeed before any deletion — the attachment is the archive.
  await send(options.email, data, file);

  if (options.deleteAfterSend) {
    await prisma.$transaction([
      prisma.customerTransaction.deleteMany({
        where: {
          businessId: options.businessId,
          createdAt: { gte: data.start, lt: data.end },
        },
      }),
      prisma.business.update({
        where: { id: options.businessId },
        data: { lastReportPeriod: data.period },
      }),
    ]);
  }

  return { rowCount: data.rows.length, period: data.period };
}

export async function runMonthlyReports(
  now: Date = new Date(),
  send?: SendReportFn,
): Promise<void> {
  const { year, month, period } = previousMonth(now);
  const businesses = await prisma.business.findMany({
    where: {
      monthlyReportEnabled: true,
      monthlyReportEmail: { not: null },
      NOT: { lastReportPeriod: period },
    },
    select: { id: true, monthlyReportEmail: true, monthlyReportFormat: true },
  });

  for (const business of businesses) {
    try {
      await runReportForBusiness({
        businessId: business.id,
        year,
        month,
        format: business.monthlyReportFormat,
        email: business.monthlyReportEmail as string,
        deleteAfterSend: true,
        send,
      });
      console.log(`[monthly-report] sent ${period} for ${business.id}`);
    } catch (error) {
      console.error(`[monthly-report] failed for ${business.id}`, error);
    }
  }
}

export function startReportScheduler(): void {
  cron.schedule("0 2 * * *", () => {
    void runMonthlyReports();
  });
  console.log("[monthly-report] scheduler started");
}
