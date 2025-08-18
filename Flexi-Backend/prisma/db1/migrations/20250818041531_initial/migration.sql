/*
  Warnings:

  - You are about to drop the column `expiredAt` on the `Bill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "expiredAt",
ADD COLUMN     "priceValid" TIMESTAMP(3);
