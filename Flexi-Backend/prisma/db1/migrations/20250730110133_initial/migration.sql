/*
  Warnings:

  - You are about to drop the column `amount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Bill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductItem" DROP CONSTRAINT "ProductItem_billId_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "amount",
DROP COLUMN "price";

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_id_fkey" FOREIGN KEY ("id") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
