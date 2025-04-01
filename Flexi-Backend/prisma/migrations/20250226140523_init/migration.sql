/*
  Warnings:

  - You are about to drop the column `businessId` on the `Member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_businessId_fkey";

-- DropIndex
DROP INDEX "Member_businessId_key";

-- DropIndex
DROP INDEX "Member_uniqueId_key";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "businessId";

-- AddForeignKey
ALTER TABLE "BusinessAcc" ADD CONSTRAINT "BusinessAcc_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
