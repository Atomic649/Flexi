-- CreateEnum
CREATE TYPE "Bank" AS ENUM ('SCB', 'KBANK', 'KTB', 'BBL', 'TMB');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "channal" "Bank",
ADD COLUMN     "deleted" BOOLEAN DEFAULT false,
ADD COLUMN     "note" TEXT;
