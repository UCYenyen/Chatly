-- AlterTable
ALTER TABLE "analytics_event" ADD COLUMN     "messageContent" TEXT;

-- CreateTable
CREATE TABLE "customer_transaction" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "xenditInvoiceId" TEXT,
    "xenditExternalId" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_intent" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_intent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_state" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_transaction_xenditInvoiceId_key" ON "customer_transaction"("xenditInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_transaction_xenditExternalId_key" ON "customer_transaction"("xenditExternalId");

-- CreateIndex
CREATE INDEX "customer_transaction_businessId_idx" ON "customer_transaction"("businessId");

-- CreateIndex
CREATE INDEX "customer_transaction_customerPhone_idx" ON "customer_transaction"("customerPhone");

-- CreateIndex
CREATE INDEX "business_intent_businessId_idx" ON "business_intent"("businessId");

-- CreateIndex
CREATE INDEX "conversation_state_businessId_idx" ON "conversation_state"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_state_businessId_phone_key" ON "conversation_state"("businessId", "phone");

-- AddForeignKey
ALTER TABLE "customer_transaction" ADD CONSTRAINT "customer_transaction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_intent" ADD CONSTRAINT "business_intent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
