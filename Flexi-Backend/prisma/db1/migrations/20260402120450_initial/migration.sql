-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "billLevelDiscountIsPercent" BOOLEAN DEFAULT false,
ADD COLUMN     "billLevelDiscountPercent" DOUBLE PRECISION DEFAULT 0;
