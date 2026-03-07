/*
  Warnings:

  - A unique constraint covering the columns `[flexiId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "flexidb"."Expense" ADD COLUMN     "flexiId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_flexiId_key" ON "flexidb"."Expense"("flexiId");
