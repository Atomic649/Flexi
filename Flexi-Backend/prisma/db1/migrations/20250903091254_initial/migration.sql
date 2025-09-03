/*
  Warnings:

  - You are about to drop the column `taxId` on the `BusinessAcc` table. All the data in the column will be lost.
  - The `group` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[vatId]` on the table `BusinessAcc` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vatId` to the `BusinessAcc` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BusinessAcc_taxId_key";

-- AlterTable
ALTER TABLE "BusinessAcc" DROP COLUMN "taxId",
ADD COLUMN     "vatId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "group",
ADD COLUMN     "group" "ExpenseGroup";

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAcc_vatId_key" ON "BusinessAcc"("vatId");
