/*
  Warnings:

  - The values [Hotel] on the enum `BusinessType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BusinessType_new" AS ENUM ('OnlineSale', 'Massage', 'Restaurant', 'Bar', 'Cafe', 'Rental', 'Tutor', 'Influencer', 'Other');
ALTER TABLE "BusinessAcc" ALTER COLUMN "businessType" DROP DEFAULT;
ALTER TABLE "BusinessAcc" ALTER COLUMN "businessType" TYPE "BusinessType_new" USING ("businessType"::text::"BusinessType_new");
ALTER TYPE "BusinessType" RENAME TO "BusinessType_old";
ALTER TYPE "BusinessType_new" RENAME TO "BusinessType";
DROP TYPE "BusinessType_old";
ALTER TABLE "BusinessAcc" ALTER COLUMN "businessType" SET DEFAULT 'OnlineSale';
COMMIT;
