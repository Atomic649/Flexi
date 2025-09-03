/*
  Warnings:

  - You are about to drop the column `vatId` on the `BusinessAcc` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taxId]` on the table `BusinessAcc` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taxId` to the `BusinessAcc` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BusinessAcc_vatId_key";

-- AlterTable
ALTER TABLE "BusinessAcc" DROP COLUMN "vatId",
ADD COLUMN     "taxId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAcc_taxId_key" ON "BusinessAcc"("taxId");
