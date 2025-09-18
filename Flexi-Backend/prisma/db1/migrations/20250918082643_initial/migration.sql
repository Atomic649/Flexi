-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('Pass', 'Fail', 'Warning');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "status" "ExpenseStatus";
