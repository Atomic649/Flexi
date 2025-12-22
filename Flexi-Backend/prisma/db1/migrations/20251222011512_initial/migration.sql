/*
  Warnings:

  - You are about to drop the column `platform` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `platformId` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SocialMedia" ADD VALUE 'Offline';

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_businessAcc_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_memberId_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "platform",
DROP COLUMN "storeId",
ADD COLUMN     "platformId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Store";

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
