-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "rentalStockReleased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validContactUntil" TIMESTAMP(3);
