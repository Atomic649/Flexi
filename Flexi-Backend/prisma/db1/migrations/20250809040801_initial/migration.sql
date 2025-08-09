-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "TaxType" "taxType" DEFAULT 'Individual',
ADD COLUMN     "note" TEXT,
ADD COLUMN     "repeat" BOOLEAN DEFAULT false,
ADD COLUMN     "repeatMonths" INTEGER DEFAULT 0;
