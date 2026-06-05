-- AlterTable
ALTER TABLE "business" ADD COLUMN     "businessHours" JSONB,
ADD COLUMN     "handoverHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timezone" TEXT;
