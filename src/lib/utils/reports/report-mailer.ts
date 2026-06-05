import { getTransporter } from "@/lib/utils/mailer";
import type { MonthlyReportData, ReportFile } from "@/types/report.md";

export async function sendMonthlyReport(
  toEmail: string,
  data: MonthlyReportData,
  file: ReportFile,
): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: '"CHATLY" <no-reply@chatly.com>',
    to: toEmail,
    subject: `Laporan Transaksi ${data.periodLabel} - ${data.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Laporan Transaksi ${data.periodLabel}</h2>
        <p>Berikut laporan transaksi untuk <strong>${data.businessName}</strong> periode ${data.periodLabel}.</p>
        <ul>
          <li>Total transaksi: ${data.summary.totalTransactions}</li>
          <li>Transaksi dibayar: ${data.summary.paidTransactions}</li>
          <li>Total pendapatan: Rp ${data.summary.totalRevenue.toLocaleString("id-ID")}</li>
        </ul>
        <p>File laporan terlampir.</p>
      </div>
    `,
    attachments: [
      {
        filename: file.filename,
        content: file.buffer,
        contentType: file.mimeType,
      },
    ],
  });
}
