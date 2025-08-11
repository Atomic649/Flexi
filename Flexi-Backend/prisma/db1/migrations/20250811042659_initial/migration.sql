/*
  Warnings:

  - The values [Bill] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('Invoice', 'Receipt', 'Quotation');
ALTER TABLE "Bill" ALTER COLUMN "DocumentType" DROP DEFAULT;
ALTER TABLE "BusinessAcc" ALTER COLUMN "DocumentType" TYPE "DocumentType_new"[] USING ("DocumentType"::text::"DocumentType_new"[]);
ALTER TABLE "Bill" ALTER COLUMN "DocumentType" TYPE "DocumentType_new" USING ("DocumentType"::text::"DocumentType_new");
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "DocumentType_old";
ALTER TABLE "Bill" ALTER COLUMN "DocumentType" SET DEFAULT 'Receipt';
COMMIT;

-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "DocumentType" SET DEFAULT 'Receipt';
