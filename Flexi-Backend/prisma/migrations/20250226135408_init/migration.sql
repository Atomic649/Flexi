-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_businessId_fkey";

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "businessId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE SET NULL ON UPDATE CASCADE;
