/*
  Warnings:

  - You are about to drop the column `businessType` on the `User` table. All the data in the column will be lost.
  - Added the required column `businessType` to the `BusinessAcc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `BusinessAcc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BusinessAcc" ADD COLUMN     "businessType" "Category" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "businessType";
