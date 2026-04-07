/*
  Warnings:

  - Made the column `purchaseAt` on table `Bill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "receiptAt" TIMESTAMP(3),
ALTER COLUMN "purchaseAt" SET NOT NULL;
