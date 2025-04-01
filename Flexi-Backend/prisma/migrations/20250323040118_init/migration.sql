/*
  Warnings:

  - You are about to drop the column `bankNo` on the `DetectPDF` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `DetectPDF` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DetectPDF" DROP COLUMN "bankNo",
DROP COLUMN "deleted";
