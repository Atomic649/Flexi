/*
  Warnings:

  - You are about to drop the `DetectPDF` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetectPDF" DROP CONSTRAINT "DetectPDF_businessAcc_fkey";

-- DropForeignKey
ALTER TABLE "DetectPDF" DROP CONSTRAINT "DetectPDF_memberId_fkey";

-- DropTable
DROP TABLE "DetectPDF";
