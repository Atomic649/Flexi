/*
  Warnings:

  - Changed the type of `product` on the `AdsCost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `product` on the `ProductItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "flexidb"."AdsCost" DROP CONSTRAINT "AdsCost_product_fkey";

-- DropForeignKey
ALTER TABLE "flexidb"."ProductItem" DROP CONSTRAINT "ProductItem_product_fkey";

-- DropIndex
DROP INDEX "flexidb"."Product_name_key";

-- AlterTable
ALTER TABLE "flexidb"."AdsCost" DROP COLUMN "product",
ADD COLUMN     "product" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "flexidb"."ProductItem" DROP COLUMN "product",
ADD COLUMN     "product" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "flexidb"."ProductItem" ADD CONSTRAINT "ProductItem_product_fkey" FOREIGN KEY ("product") REFERENCES "flexidb"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."AdsCost" ADD CONSTRAINT "AdsCost_product_fkey" FOREIGN KEY ("product") REFERENCES "flexidb"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
