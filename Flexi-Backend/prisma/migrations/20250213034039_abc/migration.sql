/*
  Warnings:

  - Added the required column `businessAcc` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "IncomeChannel" ADD VALUE 'Storefornt';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "businessAcc" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
