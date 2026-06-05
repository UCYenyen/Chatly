-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'XLSX');

-- AlterTable
ALTER TABLE "business"
  ADD COLUMN "monthlyReportEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "monthlyReportEmail" TEXT,
  ADD COLUMN "monthlyReportFormat" "ReportFormat" NOT NULL DEFAULT 'XLSX',
  ADD COLUMN "lastReportPeriod" TEXT;
