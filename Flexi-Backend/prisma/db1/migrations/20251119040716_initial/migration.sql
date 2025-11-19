-- AlterTable
ALTER TABLE "BusinessAcc" ADD COLUMN     "memberIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
