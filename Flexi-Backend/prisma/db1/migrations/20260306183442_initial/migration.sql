/*
  Warnings:

  - A unique constraint covering the columns `[billFlexiId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "flexidb"."Expense" ADD COLUMN     "billFlexiId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_billFlexiId_key" ON "flexidb"."Expense"("billFlexiId");

-- AddForeignKey
ALTER TABLE "flexidb"."Expense" ADD CONSTRAINT "Expense_billFlexiId_fkey" FOREIGN KEY ("billFlexiId") REFERENCES "flexidb"."Bill"("flexiId") ON DELETE SET NULL ON UPDATE CASCADE;
