-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'partner';

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_businessId_fkey";

-- CreateTable
CREATE TABLE "_BusinessAccToMember" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BusinessAccToMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BusinessAccToMember_B_index" ON "_BusinessAccToMember"("B");

-- AddForeignKey
ALTER TABLE "_BusinessAccToMember" ADD CONSTRAINT "_BusinessAccToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToMember" ADD CONSTRAINT "_BusinessAccToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Member"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
