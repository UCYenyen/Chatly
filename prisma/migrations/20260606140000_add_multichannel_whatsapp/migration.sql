-- Allow multiple WhatsApp channels per business
DROP INDEX "whatsapp_auth_businessId_authType_key";

-- Track which channel a customer transaction was created on
ALTER TABLE "customer_transaction" ADD COLUMN "whatsAppAuthId" TEXT;

-- AddForeignKey
ALTER TABLE "customer_transaction" ADD CONSTRAINT "customer_transaction_whatsAppAuthId_fkey" FOREIGN KEY ("whatsAppAuthId") REFERENCES "whatsapp_auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
