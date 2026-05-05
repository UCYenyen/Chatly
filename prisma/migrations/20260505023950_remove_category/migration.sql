/*
  Warnings:

  - You are about to drop the column `category` on the `business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "business" DROP COLUMN "category";

-- DropEnum
DROP TYPE "BusinessCategory";
