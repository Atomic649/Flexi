/*
  Warnings:

  - The primary key for the `BusinessAcc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `BusinessAcc` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `businessId` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_AgencyToBusinessAcc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BankToBusinessAcc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BusinessAccToCoach` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BusinessAccToOffice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BusinessAccToOrm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `B` on the `_AgencyToBusinessAcc` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_BankToBusinessAcc` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_BusinessAccToCoach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_BusinessAccToOffice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_BusinessAccToOrm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_businessId_fkey";

-- DropForeignKey
ALTER TABLE "_AgencyToBusinessAcc" DROP CONSTRAINT "_AgencyToBusinessAcc_B_fkey";

-- DropForeignKey
ALTER TABLE "_BankToBusinessAcc" DROP CONSTRAINT "_BankToBusinessAcc_B_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToCoach" DROP CONSTRAINT "_BusinessAccToCoach_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOffice" DROP CONSTRAINT "_BusinessAccToOffice_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOrm" DROP CONSTRAINT "_BusinessAccToOrm_A_fkey";

-- AlterTable
ALTER TABLE "BusinessAcc" DROP CONSTRAINT "BusinessAcc_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "BusinessAcc_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "businessId",
ADD COLUMN     "businessId" INTEGER;

-- AlterTable
ALTER TABLE "_AgencyToBusinessAcc" DROP CONSTRAINT "_AgencyToBusinessAcc_AB_pkey",
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_AgencyToBusinessAcc_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BankToBusinessAcc" DROP CONSTRAINT "_BankToBusinessAcc_AB_pkey",
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_BankToBusinessAcc_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BusinessAccToCoach" DROP CONSTRAINT "_BusinessAccToCoach_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_BusinessAccToCoach_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BusinessAccToOffice" DROP CONSTRAINT "_BusinessAccToOffice_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_BusinessAccToOffice_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BusinessAccToOrm" DROP CONSTRAINT "_BusinessAccToOrm_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_BusinessAccToOrm_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "_AgencyToBusinessAcc_B_index" ON "_AgencyToBusinessAcc"("B");

-- CreateIndex
CREATE INDEX "_BankToBusinessAcc_B_index" ON "_BankToBusinessAcc"("B");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOffice" ADD CONSTRAINT "_BusinessAccToOffice_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToCoach" ADD CONSTRAINT "_BusinessAccToCoach_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOrm" ADD CONSTRAINT "_BusinessAccToOrm_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankToBusinessAcc" ADD CONSTRAINT "_BankToBusinessAcc_B_fkey" FOREIGN KEY ("B") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToBusinessAcc" ADD CONSTRAINT "_AgencyToBusinessAcc_B_fkey" FOREIGN KEY ("B") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;
