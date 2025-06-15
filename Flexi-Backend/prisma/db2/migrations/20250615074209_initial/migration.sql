/*
  Warnings:

  - The primary key for the `Agency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Agency` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Bank` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Bank` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Coach` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Coach` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Office` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Office` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Orm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Orm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `_AgencyToBusinessAcc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BankToBusinessAcc` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BusinessAccToCoach` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BusinessAccToOffice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_BusinessAccToOrm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `A` on the `_AgencyToBusinessAcc` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_BankToBusinessAcc` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_BusinessAccToCoach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_BusinessAccToOffice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_BusinessAccToOrm` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_AgencyToBusinessAcc" DROP CONSTRAINT "_AgencyToBusinessAcc_A_fkey";

-- DropForeignKey
ALTER TABLE "_BankToBusinessAcc" DROP CONSTRAINT "_BankToBusinessAcc_A_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToCoach" DROP CONSTRAINT "_BusinessAccToCoach_B_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOffice" DROP CONSTRAINT "_BusinessAccToOffice_B_fkey";

-- DropForeignKey
ALTER TABLE "_BusinessAccToOrm" DROP CONSTRAINT "_BusinessAccToOrm_B_fkey";

-- AlterTable
ALTER TABLE "Agency" DROP CONSTRAINT "Agency_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Agency_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Bank_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Coach_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Office" DROP CONSTRAINT "Office_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Office_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Orm" DROP CONSTRAINT "Orm_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Orm_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_AgencyToBusinessAcc" DROP CONSTRAINT "_AgencyToBusinessAcc_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_AgencyToBusinessAcc_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BankToBusinessAcc" DROP CONSTRAINT "_BankToBusinessAcc_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
ADD CONSTRAINT "_BankToBusinessAcc_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BusinessAccToCoach" DROP CONSTRAINT "_BusinessAccToCoach_AB_pkey",
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_BusinessAccToCoach_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BusinessAccToOffice" DROP CONSTRAINT "_BusinessAccToOffice_AB_pkey",
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_BusinessAccToOffice_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_BusinessAccToOrm" DROP CONSTRAINT "_BusinessAccToOrm_AB_pkey",
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL,
ADD CONSTRAINT "_BusinessAccToOrm_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessAccToCoach_B_index" ON "_BusinessAccToCoach"("B");

-- CreateIndex
CREATE INDEX "_BusinessAccToOffice_B_index" ON "_BusinessAccToOffice"("B");

-- CreateIndex
CREATE INDEX "_BusinessAccToOrm_B_index" ON "_BusinessAccToOrm"("B");

-- AddForeignKey
ALTER TABLE "_BusinessAccToOffice" ADD CONSTRAINT "_BusinessAccToOffice_B_fkey" FOREIGN KEY ("B") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToCoach" ADD CONSTRAINT "_BusinessAccToCoach_B_fkey" FOREIGN KEY ("B") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOrm" ADD CONSTRAINT "_BusinessAccToOrm_B_fkey" FOREIGN KEY ("B") REFERENCES "Orm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankToBusinessAcc" ADD CONSTRAINT "_BankToBusinessAcc_A_fkey" FOREIGN KEY ("A") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToBusinessAcc" ADD CONSTRAINT "_AgencyToBusinessAcc_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
