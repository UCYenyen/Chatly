-- CreateTable
CREATE TABLE "ignored_contact" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ignored_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ignored_contact_businessId_idx" ON "ignored_contact"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "ignored_contact_businessId_phoneNumber_key" ON "ignored_contact"("businessId", "phoneNumber");

-- AddForeignKey
ALTER TABLE "ignored_contact" ADD CONSTRAINT "ignored_contact_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
