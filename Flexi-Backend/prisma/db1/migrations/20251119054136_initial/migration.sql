/*
  Warnings:

  - You are about to drop the column `memberIds` on the `BusinessAcc` table. All the data in the column will be lost.
  - The `memberId` column on the `BusinessAcc` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_BusinessAccToMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BusinessAccToMember" DROP CONSTRAINT "_BusinessAccToMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToMember" DROP CONSTRAINT "_BusinessAccToMember_B_fkey";

-- AlterTable
ALTER TABLE "BusinessAcc" DROP COLUMN "memberIds",
DROP COLUMN "memberId",
ADD COLUMN     "memberId" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "_BusinessAccToMember";

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
