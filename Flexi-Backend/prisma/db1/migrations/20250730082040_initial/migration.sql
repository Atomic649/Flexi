-- DropForeignKey
ALTER TABLE "ProductItem" DROP CONSTRAINT "ProductItem_billId_fkey";

-- AlterTable
ALTER TABLE "ProductItem" ALTER COLUMN "billId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
