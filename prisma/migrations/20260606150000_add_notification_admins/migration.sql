-- CreateEnum
CREATE TYPE "NotificationAdminStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "HandoverAssignmentStatus" AS ENUM ('ASSIGNED', 'CLAIMED', 'SUPERSEDED', 'EXPIRED');

-- AlterTable
ALTER TABLE "business" ADD COLUMN "handoverReassignSeconds" INTEGER NOT NULL DEFAULT 120;

-- AlterTable
ALTER TABLE "handover" ADD COLUMN "claimedAt" TIMESTAMP(3),
ADD COLUMN "claimedByAdminId" TEXT,
ADD COLUMN "webPushExhausted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "notification_admin" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "NotificationAdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "inviteToken" TEXT NOT NULL,
    "lastAssignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_device" (
    "id" TEXT NOT NULL,
    "notificationAdminId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "authKey" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handover_assignment" (
    "id" TEXT NOT NULL,
    "handoverId" TEXT NOT NULL,
    "notificationAdminId" TEXT NOT NULL,
    "claimToken" TEXT NOT NULL,
    "status" "HandoverAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handover_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "handover_status_claimedAt_webPushExhausted_idx" ON "handover"("status", "claimedAt", "webPushExhausted");

-- CreateIndex
CREATE UNIQUE INDEX "notification_admin_inviteToken_key" ON "notification_admin"("inviteToken");

-- CreateIndex
CREATE INDEX "notification_admin_businessId_status_idx" ON "notification_admin"("businessId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "notification_device_endpoint_key" ON "notification_device"("endpoint");

-- CreateIndex
CREATE INDEX "notification_device_notificationAdminId_idx" ON "notification_device"("notificationAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "handover_assignment_claimToken_key" ON "handover_assignment"("claimToken");

-- CreateIndex
CREATE INDEX "handover_assignment_handoverId_status_idx" ON "handover_assignment"("handoverId", "status");

-- AddForeignKey
ALTER TABLE "notification_admin" ADD CONSTRAINT "notification_admin_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_device" ADD CONSTRAINT "notification_device_notificationAdminId_fkey" FOREIGN KEY ("notificationAdminId") REFERENCES "notification_admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handover_assignment" ADD CONSTRAINT "handover_assignment_handoverId_fkey" FOREIGN KEY ("handoverId") REFERENCES "handover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handover_assignment" ADD CONSTRAINT "handover_assignment_notificationAdminId_fkey" FOREIGN KEY ("notificationAdminId") REFERENCES "notification_admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
