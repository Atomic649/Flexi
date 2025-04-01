/*
  Warnings:

  - Added the required column `memberId` to the `Platform` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "memberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "memberId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
