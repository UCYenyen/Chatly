import ExcelJS from "exceljs";
import type {
  MonthlyReportData,
  ReportFile,
  ReportFormat,
} from "@/types/report.md";

function slugify(value: string): string {
  return (
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "bisnis"
  );
}

function escapeCsv(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function guardFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function sanitizeCsvCell(value: string): string {
  return escapeCsv(guardFormula(value));
}

function buildCsv(data: MonthlyReportData): string {
  const lines: string[] = [];
  lines.push(`Laporan Transaksi,${sanitizeCsvCell(data.businessName)}`);
  lines.push(`Periode,${sanitizeCsvCell(data.periodLabel)}`);
  lines.push("");
  lines.push("Ringkasan");
  lines.push(`Total Transaksi,${data.summary.totalTransactions}`);
  lines.push(`Transaksi Dibayar,${data.summary.paidTransactions}`);
  lines.push(`Total Pendapatan,${data.summary.totalRevenue}`);
  lines.push(`Tingkat Konversi,${data.summary.conversionRate.toFixed(2)}%`);
  lines.push("");
  lines.push("Tanggal,Nama,Nomor,Deskripsi,Jumlah,Mata Uang,Status");
  for (const row of data.rows) {
    lines.push(
      [
        sanitizeCsvCell(row.date),
        sanitizeCsvCell(row.name),
        sanitizeCsvCell(row.customerPhone),
        sanitizeCsvCell(row.description),
        String(row.amount),
        sanitizeCsvCell(row.currency),
        sanitizeCsvCell(row.status),
      ].join(","),
    );
  }
  return lines.join("\n");
}

async function buildXlsx(data: MonthlyReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  const summary = workbook.addWorksheet("Ringkasan");
  summary.addRow(["Laporan Transaksi", data.businessName]);
  summary.addRow(["Periode", data.periodLabel]);
  summary.addRow([]);
  summary.addRow(["Total Transaksi", data.summary.totalTransactions]);
  summary.addRow(["Transaksi Dibayar", data.summary.paidTransactions]);
  summary.addRow(["Total Pendapatan", data.summary.totalRevenue]);
  summary.addRow([
    "Tingkat Konversi",
    `${data.summary.conversionRate.toFixed(2)}%`,
  ]);

  const sheet = workbook.addWorksheet("Transaksi");
  sheet.addRow([
    "Tanggal", "Nama", "Nomor", "Deskripsi", "Jumlah", "Mata Uang", "Status",
  ]);
  for (const row of data.rows) {
    sheet.addRow([
      guardFormula(row.date),
      guardFormula(row.name),
      guardFormula(row.customerPhone),
      guardFormula(row.description),
      row.amount,
      guardFormula(row.currency),
      guardFormula(row.status),
    ]);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}

export async function buildReportFile(
  data: MonthlyReportData,
  format: ReportFormat,
): Promise<ReportFile> {
  const base = `laporan-${slugify(data.businessName)}-${data.period}`;
  if (format === "CSV") {
    return {
      filename: `${base}.csv`,
      buffer: Buffer.from(buildCsv(data), "utf-8"),
      mimeType: "text/csv",
    };
  }
  return {
    filename: `${base}.xlsx`,
    buffer: await buildXlsx(data),
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
