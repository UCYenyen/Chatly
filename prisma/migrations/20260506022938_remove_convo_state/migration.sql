/*
  Warnings:

  - You are about to drop the column `aiEnabled` on the `conversation_state` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `conversation_state` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('AI', 'HUMAN');

-- AlterTable
ALTER TABLE "conversation_state" DROP COLUMN "aiEnabled",
DROP COLUMN "reason",
ADD COLUMN     "mode" "ConversationMode" NOT NULL DEFAULT 'AI';
