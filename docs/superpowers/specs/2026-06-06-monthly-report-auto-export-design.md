# Monthly Auto-Export Report — Design

## Context

Business owners currently have no way to receive their transaction data outside the dashboard. This feature automatically emails each business a monthly report (transactions + summary) as a `.csv` or `.xlsx` file, to a **user-specified destination email** (explicitly NOT defaulting to the account's authentication email). The send is fully automatic — once configured, the system mails the previous month's report early each month with no user action. The onboarding tutorial must also inform users this feature exists and where to configure it.

## Decisions (locked)

- **Report contents:** the month's `CustomerTransaction` rows + a summary (total revenue, # paid, # total, conversion).
- **Scheduling:** in-app `node-cron` started from Next.js `instrumentation.ts` (self-contained; fits the single-instance Docker deploy).
- **Format:** both CSV and XLSX; the user picks per business (`exceljs` added for XLSX).
- **Config scope:** per business, stored on the `Business` model (mirrors existing `notificationPhone`).
- **Timing/period:** sent early next month, covering the **previous full calendar month** (e.g. early June → all of May).
- **Manual test:** a "Kirim sekarang" button + endpoint so owners can verify config without waiting a month.

## 1. Data model (`prisma/schema.prisma`)

New enum and `Business` fields:

```prisma
enum ReportFormat {
  CSV
  XLSX
}

// added to model Business
monthlyReportEnabled Boolean      @default(false)
monthlyReportEmail   String?
monthlyReportFormat  ReportFormat @default(XLSX)
lastReportPeriod     String?      // "YYYY-MM" of the last period successfully sent (idempotency)
```

Migration: `add_monthly_report_settings`. Because the shadow DB can't replay a pre-existing pgvector migration ordering issue, the migration is authored manually and applied with `prisma migrate deploy` (same approach as `add_user_onboarding_completed`).

## 2. Types (`src/types/`)

- `report.md.ts` — `ReportFormat` (mirrors enum), `MonthlyReportSummary`, `MonthlyReportData`, `MonthlyReportConfig`, `SendReportResponse`.
- Extend `UpdateBusinessRequest` and `BusinessDTO` (`business.md.ts`) with `monthlyReportEnabled`, `monthlyReportEmail`, `monthlyReportFormat`.

## 3. Settings UI

`src/components/features/training/MonthlyReport.tsx` — a shadcn `Card` rendered on the training page (`src/app/(dashboard)/business/[businessId]/training/page.tsx`), placed near `BusinessHours`:
- `Switch` — "Aktifkan laporan bulanan otomatis".
- `Input type="email"` — destination email (placeholder makes clear it is independent of the login email).
- `Select` — CSV / XLSX.
- Save button → existing `useUpdateBusiness` (`PATCH /api/businesses/[id]`).
- "Kirim sekarang" button → `POST /api/businesses/[id]/reports/send` (immediate send of last month's report to verify config).
- Validation via react-hook-form + zod: when enabled, email required and must be a valid address.
- Has `data-tour="monthly-report"` for the tutorial.

Backend wiring: extend the `PATCH /api/businesses/[id]` handler to accept the new fields, and `toBusinessDTO` (`src/lib/utils/business-dto.ts`) to expose them.

## 4. Report generation (`src/lib/utils/reports/`)

- `report-data.ts` — `getMonthlyReportData(businessId, year, month): Promise<MonthlyReportData>`. Computes month boundaries in the business `timezone` (default `Asia/Jakarta`), fetches `CustomerTransaction`s with `createdAt` in `[start, end)`, and derives the summary (revenue = sum of PAID amounts, counts, conversion %). Returns business name + period label + rows + summary.
- `report-file.ts` — `buildReportFile(data, format): { filename, buffer, mimeType }`. CSV built manually with RFC-4180 escaping (quotes/commas/newlines). XLSX via `exceljs` with two worksheets: **Ringkasan** (summary) and **Transaksi** (rows). Filename like `laporan-<business>-2026-05.xlsx`.
- `report-mailer.ts` — `sendMonthlyReport(toEmail, data, file)`: composes a short Indonesian email body and attaches the file.
- `runMonthlyReports()` — the batch entry point (see §5).

### Shared mailer (targeted cleanup)
Extract the inline Gmail transporter from `src/lib/utils/auth/auth.ts` into `src/lib/utils/mailer.ts` (`getTransporter()` / `sendMail()`), and have both auth and reports use it. Uses existing `GMAIL_USER` / `GMAIL_APP_PASSWORD` envs.

## 5. Scheduler (in-app `node-cron`)

- `src/instrumentation.ts` exports `register()`. Guarded by `process.env.NEXT_RUNTIME === "nodejs"` **and** `process.env.NODE_ENV === "production"` (never runs in dev). Starts a `node-cron` job.
- `src/lib/utils/reports/scheduler.ts` — `startReportScheduler()` schedules a **daily** run at `0 2 * * *` (02:00) calling `runMonthlyReports()`.
- `runMonthlyReports()`:
  1. Compute the previous calendar month `period = "YYYY-MM"`.
  2. Find businesses where `monthlyReportEnabled === true`, `monthlyReportEmail` set, and `lastReportPeriod !== period`.
  3. For each (independently, try/catch + log): build data → build file → send email → set `lastReportPeriod = period`.
- Daily cadence + the `lastReportPeriod` guard gives automatic catch-up (if the server was down on the 1st it sends the next day) with no duplicate sends.
- **Single-instance assumption:** `docker-compose` runs one app instance, so no distributed lock is needed. Documented as a known constraint for future horizontal scaling.

## 6. Manual send endpoint

`src/app/api/businesses/[id]/reports/send/route.ts` — `POST`. Auth via `auth.api.getSession`; verifies the session user owns the business. Generates the previous month's report (or a `?period=YYYY-MM` override) and emails it to the configured `monthlyReportEmail` (400 if not set). Returns `SendReportResponse`. Does **not** modify `lastReportPeriod` (manual sends are test sends and must not suppress the scheduled one).

## 7. Tutorial integration

- Add a step to `src/components/features/tour/tour-steps.ts` after `training-notification-phone` (same `/business/:id/training` route), `targetSelector: '[data-tour="monthly-report"]'`, copy: *"Atur laporan bulanan otomatis: pilih email tujuan dan format (CSV atau XLSX). Sistem akan mengirim laporan transaksi bulan sebelumnya secara otomatis setiap bulan."*
- No other tour changes needed (step count derives from the array).

## New dependency

- `exceljs` (pure JS, MIT, no native deps — safe for the Docker build) for XLSX generation. `node-cron` for scheduling. CSV needs no library.

## Out of scope (YAGNI)

- Configurable schedules/frequency (weekly, custom day) — monthly only.
- Report history/audit table — `lastReportPeriod` string suffices.
- Distributed lock / multi-instance coordination — single instance today.
- Including analytics/chat logs — transactions + summary only.

## Verification

1. **Migration:** apply, confirm new columns + `ReportFormat` enum in Prisma Studio.
2. **UI:** training page shows the card; saving persists email/format/toggle; `GET` business reflects them.
3. **Manual send:** configure an email, click "Kirim sekarang" → email arrives with correct CSV/XLSX attachment and a non-empty summary for a month that has transactions.
4. **File correctness:** CSV opens cleanly (escaping intact); XLSX has Ringkasan + Transaksi sheets with correct totals.
5. **Scheduler logic:** unit-invoke `runMonthlyReports()` (e.g. a temporary script) with a seeded `lastReportPeriod` to confirm it skips already-sent periods and stamps after sending.
6. **Tutorial:** the new step appears on the training page spotlighting the report card.
7. **Quality:** `pnpm lint` + `pnpm build` clean (strict TS, no `any`).
