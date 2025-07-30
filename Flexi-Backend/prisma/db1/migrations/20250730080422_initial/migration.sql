/*
  Warnings:

  - You are about to drop the column `product` on the `Bill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_product_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "product";

-- CreateTable
CREATE TABLE "ProductItem" (
    "id" SERIAL NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "billId" INTEGER NOT NULL,

    CONSTRAINT "ProductItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_product_fkey" FOREIGN KEY ("product") REFERENCES "Product"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
