/*
  Warnings:

  - A unique constraint covering the columns `[businessId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessId` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BusinessAcc" DROP CONSTRAINT "BusinessAcc_memberId_fkey";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "businessId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_businessId_key" ON "Member"("businessId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
