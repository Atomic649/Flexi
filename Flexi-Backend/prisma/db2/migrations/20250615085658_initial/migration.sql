/*
  Warnings:

  - You are about to drop the `_AgencyToBusinessAcc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BankToBusinessAcc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BusinessAccToCoach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BusinessAccToOffice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BusinessAccToOrm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AgencyToBusinessAcc" DROP CONSTRAINT "_AgencyToBusinessAcc_A_fkey";

-- DropForeignKey
ALTER TABLE "_AgencyToBusinessAcc" DROP CONSTRAINT "_AgencyToBusinessAcc_B_fkey";

-- DropForeignKey
ALTER TABLE "_BankToBusinessAcc" DROP CONSTRAINT "_BankToBusinessAcc_A_fkey";

-- DropForeignKey
ALTER TABLE "_BankToBusinessAcc" DROP CONSTRAINT "_BankToBusinessAcc_B_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToCoach" DROP CONSTRAINT "_BusinessAccToCoach_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToCoach" DROP CONSTRAINT "_BusinessAccToCoach_B_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOffice" DROP CONSTRAINT "_BusinessAccToOffice_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOffice" DROP CONSTRAINT "_BusinessAccToOffice_B_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOrm" DROP CONSTRAINT "_BusinessAccToOrm_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOrm" DROP CONSTRAINT "_BusinessAccToOrm_B_fkey";

-- DropTable
DROP TABLE "_AgencyToBusinessAcc";

-- DropTable
DROP TABLE "_BankToBusinessAcc";

-- DropTable
DROP TABLE "_BusinessAccToCoach";

-- DropTable
DROP TABLE "_BusinessAccToOffice";

-- DropTable
DROP TABLE "_BusinessAccToOrm";

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orm" ADD CONSTRAINT "Orm_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
