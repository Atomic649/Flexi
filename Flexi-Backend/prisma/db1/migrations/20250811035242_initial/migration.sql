-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('Bill', 'Invoice', 'Receipt', 'Quotation');

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "DocumentType" "DocumentType" DEFAULT 'Bill';
