# Monthly Auto-Export Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically email each business a monthly transactions+summary report (CSV or XLSX) to a user-specified address, then permanently delete that month's transactions after a confirmed send.

**Architecture:** Per-business config on the `Business` model. A pure data/file/mail pipeline (`src/lib/utils/reports/`) is driven by both an in-app `node-cron` scheduler (started from `src/instrumentation.ts`, production-only) and an on-demand "Kirim sekarang" API route. The scheduler sends the email first and only then atomically deletes the reported rows and stamps `lastReportPeriod`; the manual route never deletes. Tutorial gains a step describing the feature.

**Tech Stack:** Next.js 16 App Router, Prisma 7 (PostgreSQL), nodemailer (Gmail), `exceljs`, `node-cron`, shadcn/ui, react-hook-form + zod.

**Testing note:** This repo has no unit-test runner (per CLAUDE.md) and no `tsx`. Verification per task is `pnpm exec tsc --noEmit` (strict types are the main safety net) + scoped `pnpm lint`. End-to-end report generation is verified through the "Kirim sekarang" button; the destructive scheduler path is verified with a documented one-time dry-run (Task 15). Pure logic (`runReportForBusiness`) is built with an **injectable `send` function** so the dry-run can exercise the exact send→delete path.

Spec: `docs/superpowers/specs/2026-06-06-monthly-report-auto-export-design.md`.

---

### Task 1: Install dependencies

**Files:** `package.json` (modified by pnpm)

- [ ] **Step 1: Install runtime + types**

```bash
pnpm add exceljs node-cron && pnpm add -D @types/node-cron
```

- [ ] **Step 2: Verify they resolve**

Run: `node -e "require('exceljs'); require('node-cron'); console.log('ok')"`
Expected: prints `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add exceljs and node-cron for monthly reports"
```

---

### Task 2: Prisma schema + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260606130000_add_monthly_report_settings/migration.sql`

- [ ] **Step 1: Add the enum** (after the existing enums, e.g. near `ReportFormat` neighbours — place at end of file's enum block)

```prisma
enum ReportFormat {
  CSV
  XLSX
}
```

- [ ] **Step 2: Add fields to `model Business`** (insert after the `notificationPhone String?` line)

```prisma
  monthlyReportEnabled Boolean      @default(false)
  monthlyReportEmail   String?
  monthlyReportFormat  ReportFormat @default(XLSX)
  lastReportPeriod     String?
```

- [ ] **Step 3: Author the migration SQL** (create the file with this exact content)

```sql
-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'XLSX');

-- AlterTable
ALTER TABLE "business"
  ADD COLUMN "monthlyReportEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "monthlyReportEmail" TEXT,
  ADD COLUMN "monthlyReportFormat" "ReportFormat" NOT NULL DEFAULT 'XLSX',
  ADD COLUMN "lastReportPeriod" TEXT;
```

- [ ] **Step 4: Apply migration and regenerate client** (the shadow DB can't replay a pre-existing pgvector migration, so use `deploy`, matching the `add_user_onboarding_completed` precedent)

Run: `pnpm prisma migrate deploy && pnpm prisma generate`
Expected: "Applying migration `20260606130000_add_monthly_report_settings`" then "All migrations have been successfully applied." and client generated.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add monthly report settings to Business"
```

---

### Task 3: Types

**Files:**
- Create: `src/types/report.md.ts`
- Modify: `src/types/business.md.ts`

- [ ] **Step 1: Create `src/types/report.md.ts`**

```typescript
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
```

- [ ] **Step 2: Extend `src/types/business.md.ts`** — add the import at the top and the three fields to both interfaces.

At the top, after the existing import:

```typescript
import type { ReportFormat } from "@/types/report.md";
```

Add to `BusinessDTO` (after `notificationPhone: string | null;`):

```typescript
  monthlyReportEnabled: boolean;
  monthlyReportEmail: string | null;
  monthlyReportFormat: ReportFormat;
```

Add to `UpdateBusinessRequest` (after `notificationPhone?: string | null;`):

```typescript
  monthlyReportEnabled?: boolean;
  monthlyReportEmail?: string | null;
  monthlyReportFormat?: ReportFormat;
```

- [ ] **Step 3: Verify types**

Run: `pnpm exec tsc --noEmit`
Expected: errors only of the form "monthlyReport... missing in toBusinessDTO return" (fixed in Task 9) — no errors inside `report.md.ts` / `business.md.ts` themselves. (If `toBusinessDTO` errors appear, that is expected and resolved in Task 9.)

- [ ] **Step 4: Commit**

```bash
git add src/types/report.md.ts src/types/business.md.ts
git commit -m "feat(types): monthly report types and Business DTO fields"
```

---

### Task 4: Shared Gmail mailer util

**Files:**
- Create: `src/lib/utils/mailer.ts`
- Modify: `src/lib/utils/auth/auth.ts`

- [ ] **Step 1: Create `src/lib/utils/mailer.ts`**

```typescript
import nodemailer, { type Transporter } from "nodemailer";

export function getTransporter(): Transporter {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}
```

- [ ] **Step 2: Refactor `auth.ts` to use it.** Add near the other imports:

```typescript
import { getTransporter } from "@/lib/utils/mailer";
```

Replace the inline `const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });` with:

```typescript
      const transporter = getTransporter();
```

(Leave the existing `nodemailer` import in `auth.ts` if other code uses it; if it becomes unused, remove it to satisfy lint.)

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/lib/utils/mailer.ts src/lib/utils/auth/auth.ts`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/mailer.ts src/lib/utils/auth/auth.ts
git commit -m "refactor(mail): extract shared Gmail transporter"
```

---

### Task 5: Report data module

**Files:** Create `src/lib/utils/reports/report-data.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/lib/utils/reports/report-data.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/reports/report-data.ts
git commit -m "feat(reports): monthly report data + timezone-aware month boundaries"
```

---

### Task 6: Report file builder (CSV + XLSX)

**Files:** Create `src/lib/utils/reports/report-file.ts`

- [ ] **Step 1: Create the file**

```typescript
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

function buildCsv(data: MonthlyReportData): string {
  const lines: string[] = [];
  lines.push(`Laporan Transaksi,${escapeCsv(data.businessName)}`);
  lines.push(`Periode,${escapeCsv(data.periodLabel)}`);
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
        escapeCsv(row.date),
        escapeCsv(row.name),
        escapeCsv(row.customerPhone),
        escapeCsv(row.description),
        String(row.amount),
        escapeCsv(row.currency),
        escapeCsv(row.status),
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
      row.date, row.name, row.customerPhone, row.description,
      row.amount, row.currency, row.status,
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
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/lib/utils/reports/report-file.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/reports/report-file.ts
git commit -m "feat(reports): CSV and XLSX file builders"
```

---

### Task 7: Report mailer

**Files:** Create `src/lib/utils/reports/report-mailer.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/lib/utils/reports/report-mailer.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/reports/report-mailer.ts
git commit -m "feat(reports): email the monthly report as an attachment"
```

---

### Task 8: Scheduler core (send-then-delete, injectable sender)

**Files:** Create `src/lib/utils/reports/scheduler.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/lib/utils/reports/scheduler.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/reports/scheduler.ts
git commit -m "feat(reports): scheduler with send-then-atomic-delete and idempotency"
```

---

### Task 9: Persist new fields (DTO + PATCH handler)

**Files:**
- Modify: `src/lib/utils/business-dto.ts`
- Modify: `src/app/api/businesses/[id]/route.ts`

- [ ] **Step 1: Add fields to `toBusinessDTO`** — insert after the `notificationPhone: b.notificationPhone,` line:

```typescript
    monthlyReportEnabled: b.monthlyReportEnabled,
    monthlyReportEmail: b.monthlyReportEmail,
    monthlyReportFormat: b.monthlyReportFormat,
```

- [ ] **Step 2: Add validation/persist in the PATCH handler** — insert this block in `src/app/api/businesses/[id]/route.ts` immediately after the `if (body.notificationPhone !== undefined) { ... }` block (before the `console.log("[PATCH ...` line):

```typescript
    if (typeof body.monthlyReportEnabled === "boolean") {
      data.monthlyReportEnabled = body.monthlyReportEnabled;
    }
    if (body.monthlyReportEmail !== undefined) {
      if (
        body.monthlyReportEmail === null ||
        body.monthlyReportEmail.trim().length === 0
      ) {
        data.monthlyReportEmail = null;
      } else {
        const email = body.monthlyReportEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return NextResponse.json(
            { message: "Email laporan tidak valid" },
            { status: 400 },
          );
        }
        data.monthlyReportEmail = email;
      }
    }
    if (body.monthlyReportFormat !== undefined) {
      if (
        body.monthlyReportFormat !== "CSV" &&
        body.monthlyReportFormat !== "XLSX"
      ) {
        return NextResponse.json(
          { message: "Format laporan tidak valid" },
          { status: 400 },
        );
      }
      data.monthlyReportFormat = body.monthlyReportFormat;
    }
```

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/lib/utils/business-dto.ts "src/app/api/businesses/[id]/route.ts"`
Expected: no errors (the Task 3 `toBusinessDTO` error is now resolved).

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/business-dto.ts "src/app/api/businesses/[id]/route.ts"
git commit -m "feat(api): persist monthly report settings on business update"
```

---

### Task 10: In-app scheduler bootstrap (instrumentation)

**Files:** Create `src/instrumentation.ts`

- [ ] **Step 1: Create the file** (Next.js auto-calls `register()` once on server startup)

```typescript
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  const { startReportScheduler } = await import(
    "@/lib/utils/reports/scheduler"
  );
  startReportScheduler();
}
```

- [ ] **Step 2: Verify build picks it up**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: build succeeds. (The scheduler will NOT start in dev because of the `NODE_ENV` guard — intended.)

- [ ] **Step 3: Commit**

```bash
git add src/instrumentation.ts
git commit -m "feat(reports): start monthly scheduler via instrumentation (prod only)"
```

---

### Task 11: Manual "send now" API route

**Files:** Create `src/app/api/businesses/[id]/reports/send/route.ts`

- [ ] **Step 1: Create the route**

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/utils/auth/auth";
import prisma from "@/lib/utils/prisma";
import {
  previousMonth,
  runReportForBusiness,
} from "@/lib/utils/reports/scheduler";
import type { SendReportResponse } from "@/types/report.md";

interface ApiErrorResponse {
  message: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parsePeriod(
  period: string | null,
): { year: number; month: number } | null {
  if (!period) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse<SendReportResponse | ApiErrorResponse>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business || business.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Bisnis tidak ditemukan" },
        { status: 404 },
      );
    }
    if (!business.monthlyReportEmail) {
      return NextResponse.json(
        { message: "Email tujuan laporan belum diatur" },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const target =
      parsePeriod(url.searchParams.get("period")) ?? previousMonth(new Date());

    const result = await runReportForBusiness({
      businessId: id,
      year: target.year,
      month: target.month,
      format: business.monthlyReportFormat,
      email: business.monthlyReportEmail,
      deleteAfterSend: false,
    });

    return NextResponse.json({
      sent: true,
      email: business.monthlyReportEmail,
      period: result.period,
      rowCount: result.rowCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kesalahan tidak diketahui";
    console.error("[POST /api/businesses/:id/reports/send]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint "src/app/api/businesses/[id]/reports/send/route.ts"`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/businesses/[id]/reports/send/route.ts"
git commit -m "feat(api): non-destructive manual send-now report endpoint"
```

---

### Task 12: Send-now hook

**Files:**
- Create: `src/hooks/use-send-report.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: Create `src/hooks/use-send-report.ts`**

```typescript
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
```

- [ ] **Step 2: Export from `src/hooks/index.ts`** — add:

```typescript
export { useSendReport } from "./use-send-report";
```

- [ ] **Step 3: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/hooks/use-send-report.ts src/hooks/index.ts`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-send-report.ts src/hooks/index.ts
git commit -m "feat(hooks): useSendReport for manual report send"
```

---

### Task 13: Settings UI card

**Files:**
- Create: `src/components/features/training/MonthlyReport.tsx`
- Modify: `src/app/(dashboard)/business/[businessId]/training/page.tsx`

- [ ] **Step 1: Ensure the shadcn `select` primitive exists**

Run: `ls src/components/ui/select.tsx`
If missing, run: `pnpm dlx shadcn@latest add select`

- [ ] **Step 2: Create `src/components/features/training/MonthlyReport.tsx`**

```typescript
"use client";

import { useState } from "react";
import { FileSpreadsheet, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useUpdateBusiness } from "@/hooks/use-update-business";
import { useSendReport } from "@/hooks/use-send-report";
import type { ReportFormat } from "@/types/report.md";

export function MonthlyReport() {
  const { activeBusiness, activeBusinessId, refresh } = useBusinessContext();
  const { updateBusiness, isPending } = useUpdateBusiness(activeBusinessId);
  const { sendNow, isPending: isSending } = useSendReport(
    activeBusinessId ?? "",
  );

  const [enabled, setEnabled] = useState<boolean>(
    activeBusiness?.monthlyReportEnabled ?? false,
  );
  const [email, setEmail] = useState<string>(
    activeBusiness?.monthlyReportEmail ?? "",
  );
  const [format, setFormat] = useState<ReportFormat>(
    activeBusiness?.monthlyReportFormat ?? "XLSX",
  );

  const handleSave = async (): Promise<void> => {
    if (enabled && email.trim().length === 0) {
      toast.error("Email tujuan wajib diisi saat laporan diaktifkan");
      return;
    }
    const updated = await updateBusiness({
      monthlyReportEnabled: enabled,
      monthlyReportEmail: email.trim().length > 0 ? email.trim() : null,
      monthlyReportFormat: format,
    });
    if (updated) {
      toast.success("Pengaturan laporan bulanan disimpan");
      await refresh();
    } else {
      toast.error("Gagal menyimpan pengaturan laporan");
    }
  };

  const handleSendNow = async (): Promise<void> => {
    const result = await sendNow();
    if (result) {
      toast.success(
        `Laporan ${result.period} (${result.rowCount} transaksi) dikirim ke ${result.email}`,
      );
    } else {
      toast.error("Gagal mengirim laporan. Pastikan email sudah disimpan.");
    }
  };

  return (
    <div
      data-tour="monthly-report"
      className="bg-surface-container-low border border-outline-variant/15 p-5 sm:p-8 rounded-xl flex flex-col shadow-xl h-fit min-w-0"
    >
      <div className="flex items-center gap-3 mb-6">
        <FileSpreadsheet className="w-5 h-5 shrink-0 text-secondary-fixed" />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">
          Laporan Bulanan Otomatis
        </h2>
      </div>

      <div className="flex items-start justify-between gap-4 p-4 rounded-md border border-outline-variant/15 bg-[#08111d] mb-6">
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-on-surface">
            Kirim laporan transaksi otomatis tiap bulan
          </span>
          <span className="text-[11px] text-outline mt-1 leading-relaxed">
            Laporan bulan sebelumnya dikirim ke email tujuan setiap awal bulan.
          </span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} className="shrink-0" />
      </div>

      <div className="flex flex-col gap-2 mb-6 min-w-0">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Email Tujuan Laporan
        </span>
        <Input
          type="email"
          inputMode="email"
          placeholder="cth. laporan@perusahaan.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span className="text-[11px] text-outline leading-relaxed">
          Email bebas (boleh berbeda dari email akun login Anda).
        </span>
      </div>

      <div className="flex flex-col gap-2 mb-6 min-w-0">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Format File
        </span>
        <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XLSX">Excel (.xlsx)</SelectItem>
            <SelectItem value="CSV">CSV (.csv)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-md border border-amber-500/30 bg-amber-500/10 mb-6">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <span className="text-[11px] text-amber-200/90 leading-relaxed">
          Setelah laporan terkirim, data transaksi bulan tersebut akan dihapus
          permanen dari sistem. File pada email menjadi satu-satunya arsip.
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
        <Button
          onClick={handleSendNow}
          disabled={isSending}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Send className="w-4 h-4" />
          {isSending ? "Mengirim..." : "Kirim sekarang"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Render it on the training page** — in `src/app/(dashboard)/business/[businessId]/training/page.tsx`, add the import and place `<MonthlyReport />` under `<BusinessHours />`. Add import:

```typescript
import { MonthlyReport } from "@/components/features/training/MonthlyReport";
```

Change the right column block:

```typescript
                    <div className="col-span-1 xl:col-span-5 flex flex-col">
                        <AiPersonality />
                        <div className="mt-8">
                            <BusinessHours />
                        </div>
                        <div className="mt-8">
                            <MonthlyReport />
                        </div>
                    </div>
```

- [ ] **Step 4: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/components/features/training/MonthlyReport.tsx "src/app/(dashboard)/business/[businessId]/training/page.tsx"`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/training/MonthlyReport.tsx "src/app/(dashboard)/business/[businessId]/training/page.tsx" src/components/ui/select.tsx
git commit -m "feat(ui): monthly report settings card with send-now and delete warning"
```

---

### Task 14: Tutorial step

**Files:** Modify `src/components/features/tour/tour-steps.ts`

- [ ] **Step 1: Insert a new step** between the `training-notification-phone` step object and the `sidebar-langganan` step object:

```typescript
  {
    id: "training-monthly-report",
    route: "/business/:id/training",
    targetSelector: '[data-tour="monthly-report"]',
    title: "Laporan Bulanan Otomatis",
    body: "Atur laporan bulanan otomatis: pilih email tujuan dan format (CSV atau XLSX). Sistem mengirim laporan transaksi bulan sebelumnya setiap bulan, lalu menghapus data transaksi bulan tersebut dari sistem (file email menjadi arsipnya).",
    placement: "bottom",
    advance: "next-button",
    allowSkip: true,
  },
```

- [ ] **Step 2: Verify**

Run: `pnpm exec tsc --noEmit && pnpm exec eslint src/components/features/tour/tour-steps.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/tour/tour-steps.ts
git commit -m "feat(tour): inform users about monthly auto-export report"
```

---

### Task 15: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Lint the whole feature surface**

Run: `pnpm exec eslint src/lib/utils/reports src/lib/utils/mailer.ts src/types/report.md.ts src/components/features/training/MonthlyReport.tsx src/hooks/use-send-report.ts src/instrumentation.ts "src/app/api/businesses/[id]/reports/send/route.ts"`
Expected: clean (0 errors).

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: success; route list includes `/api/businesses/[id]/reports/send`.

- [ ] **Step 3: Manual end-to-end (non-destructive) via "Kirim sekarang"**

1. `pnpm dev`. In the dashboard, open a business → Pelatihan. The "Laporan Bulanan Otomatis" card shows.
2. Set a destination email + format, click "Simpan Pengaturan" → success toast. Reload → values persist (confirms DTO/PATCH).
3. Ensure the business has at least one `CustomerTransaction` dated in the previous calendar month (seed via Prisma Studio if needed).
4. Click "Kirim sekarang" → success toast with row count; the configured inbox receives the email with a `.csv`/`.xlsx` attachment.
5. Open the file: CSV opens cleanly with intact escaping; XLSX has **Ringkasan** + **Transaksi** sheets and correct totals.
6. Confirm in Prisma Studio the transactions are **still present** (manual send never deletes).

- [ ] **Step 4: Scheduler delete path (one-time dry-run, then revert)**

Temporarily edit `src/instrumentation.ts` `register()` to force a single run (remove guards and call directly):

```typescript
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { runMonthlyReports } = await import("@/lib/utils/reports/scheduler");
  await runMonthlyReports(new Date());
}
```

1. Seed the test business with transactions in BOTH the previous month and the current month; ensure `monthlyReportEnabled = true`, a valid `monthlyReportEmail`, and `lastReportPeriod` NOT equal to the previous-month period.
2. Run `pnpm dev` once. Watch the log for `[monthly-report] sent <period> ...`.
3. Verify in Prisma Studio: previous-month rows are **deleted**, current-month rows **remain**, and `lastReportPeriod` is now the previous-month period. The configured inbox received the report.
4. Stop the server and **revert `src/instrumentation.ts`** to the production-guarded version from Task 10 (`git checkout src/instrumentation.ts`).

- [ ] **Step 5: Final commit (if any cleanup)**

```bash
git status   # ensure instrumentation.ts is reverted and tree is clean
```

---

## Self-Review

- **Spec coverage:** data model (T2), types (T3), settings UI + warning (T13), report data/file/mailer (T5–T7), shared mailer cleanup (T4), scheduler + send-then-delete + idempotency (T8), instrumentation prod-only (T10), manual non-destructive endpoint (T11/T12), tutorial step with deletion notice (T14), post-send hard-delete of only the reported month (T8), verification incl. deletion (T15). All spec sections mapped.
- **Type consistency:** `ReportFormat`, `MonthlyReportData`, `ReportFile`, `SendReportResponse`, `SendReportFn`, `runReportForBusiness`, `runMonthlyReports`, `previousMonth`, `getMonthlyReportData`, `buildReportFile`, `sendMonthlyReport`, `useSendReport` are defined once and referenced consistently across tasks.
- **No placeholders:** every code step contains full code; edits specify exact insertion points.
