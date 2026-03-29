-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "isExport" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "flexidb"."Expense" ADD COLUMN     "isExport" BOOLEAN DEFAULT false;
