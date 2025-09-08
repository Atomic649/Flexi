-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "branch" TEXT,
ADD COLUMN     "taxType" "taxType" DEFAULT 'Individual';
