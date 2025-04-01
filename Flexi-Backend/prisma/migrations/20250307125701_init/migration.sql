/*
  Warnings:

  - You are about to drop the column `pdf` on the `DetectPDF` table. All the data in the column will be lost.
  - Added the required column `businessAcc` to the `DetectPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `DetectPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `DetectPDF` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `DetectPDF` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetectPDF" DROP COLUMN "pdf",
ADD COLUMN     "businessAcc" INTEGER NOT NULL,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "memberId" TEXT NOT NULL,
ALTER COLUMN "bankNo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DetectPDF" ADD CONSTRAINT "DetectPDF_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectPDF" ADD CONSTRAINT "DetectPDF_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
