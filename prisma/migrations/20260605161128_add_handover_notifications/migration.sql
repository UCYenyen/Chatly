-- CreateEnum
CREATE TYPE "HandoverStatus" AS ENUM ('PENDING', 'RESOLVED', 'TIMED_OUT', 'CLOSED');

-- CreateEnum
CREATE TYPE "HandoverResolver" AS ENUM ('ADMIN', 'TIMEOUT', 'BUSINESS_CLOSED');

-- DropIndex
DROP INDEX "document_chunk_embedding_hnsw_idx";

-- AlterTable
ALTER TABLE "business" ADD COLUMN     "notificationPhone" TEXT;

-- CreateTable
CREATE TABLE "handover" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "HandoverStatus" NOT NULL DEFAULT 'PENDING',
    "resolveToken" TEXT NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminderSentAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" "HandoverResolver",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handover_resolveToken_key" ON "handover"("resolveToken");

-- CreateIndex
CREATE INDEX "handover_businessId_phone_status_idx" ON "handover"("businessId", "phone", "status");

-- AddForeignKey
ALTER TABLE "handover" ADD CONSTRAINT "handover_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
