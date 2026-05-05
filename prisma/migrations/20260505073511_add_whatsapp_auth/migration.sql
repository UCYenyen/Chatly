-- CreateEnum
CREATE TYPE "WhatsAppAuthType" AS ENUM ('OFFICIAL', 'GOWA');

-- CreateEnum
CREATE TYPE "WhatsAppAuthStatus" AS ENUM ('PENDING', 'AUTHENTICATED', 'EXPIRED', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "whatsapp_auth" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "authType" "WhatsAppAuthType" NOT NULL DEFAULT 'GOWA',
    "status" "WhatsAppAuthStatus" NOT NULL DEFAULT 'PENDING',
    "phoneNumber" TEXT,
    "qrCode" TEXT,
    "qrCodeExpiry" TIMESTAMP(3),
    "instanceKey" TEXT,
    "sessionData" JSONB,
    "lastConnected" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_auth_phoneNumber_key" ON "whatsapp_auth"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_auth_instanceKey_key" ON "whatsapp_auth"("instanceKey");

-- CreateIndex
CREATE INDEX "whatsapp_auth_businessId_idx" ON "whatsapp_auth"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_auth_businessId_authType_key" ON "whatsapp_auth"("businessId", "authType");

-- AddForeignKey
ALTER TABLE "whatsapp_auth" ADD CONSTRAINT "whatsapp_auth_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
