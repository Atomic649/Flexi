-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "vat" BOOLEAN DEFAULT false,
ADD COLUMN     "vatAmount" DECIMAL(65,30) DEFAULT 0;
