-- AlterTable
ALTER TABLE "flexidb"."Expense" ADD COLUMN     "DocumentType" "flexidb"."DocumentType" DEFAULT 'Receipt',
ADD COLUMN     "debtAmount" DECIMAL(65,30) DEFAULT 0;
