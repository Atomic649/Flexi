/*
  Warnings:

  - You are about to drop the column `facebookId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('piece', 'hour', 'course', 'list', 'box', 'pack', 'set', 'dozen');

-- AlterEnum
ALTER TYPE "Payment" ADD VALUE 'Cash';

-- DropIndex
DROP INDEX "User_facebookId_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productType" "ProductType" DEFAULT 'Product',
ADD COLUMN     "unit" "Unit" DEFAULT 'piece',
ALTER COLUMN "barcode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "facebookId",
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
