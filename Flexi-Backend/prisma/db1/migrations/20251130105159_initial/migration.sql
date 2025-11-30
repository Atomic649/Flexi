/*
  Warnings:

  - You are about to drop the column `TaxType` on the `Bill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "TaxType",
ADD COLUMN     "taxType" "taxType" DEFAULT 'Individual';
