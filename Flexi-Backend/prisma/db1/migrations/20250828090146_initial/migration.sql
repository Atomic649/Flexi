-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "WHTAmount" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "withHoldingTax" BOOLEAN DEFAULT false;
