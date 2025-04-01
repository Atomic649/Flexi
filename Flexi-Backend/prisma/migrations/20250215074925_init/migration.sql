/*
  Warnings:

  - Changed the type of `accId` on the `Store` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "accId",
ADD COLUMN     "accId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Store_accId_key" ON "Store"("accId");
