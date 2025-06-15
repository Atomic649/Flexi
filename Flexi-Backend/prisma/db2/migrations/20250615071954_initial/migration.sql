/*
  Warnings:

  - You are about to drop the `_BusinessMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agency" DROP CONSTRAINT "Agency_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Orm" DROP CONSTRAINT "Orm_authorId_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessMembers" DROP CONSTRAINT "_BusinessMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessMembers" DROP CONSTRAINT "_BusinessMembers_B_fkey";

-- AlterTable
ALTER TABLE "Agency" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Bank" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Coach" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Office" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Orm" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "_BusinessMembers";

-- CreateTable
CREATE TABLE "Member" (
    "uniqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("uniqueId")
);

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orm" ADD CONSTRAINT "Orm_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
