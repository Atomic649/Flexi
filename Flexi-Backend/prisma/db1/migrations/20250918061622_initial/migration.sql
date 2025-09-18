/*
  Warnings:

  - The values [Other] on the enum `ExpenseGroup` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseGroup_new" AS ENUM ('Employee', 'Freelancer', 'Office', 'OfficeRental', 'CarRental', 'Commission', 'Advertising', 'Marketing', 'Copyright', 'Dividend', 'Interest', 'Influencer', 'Accounting', 'Legal', 'Taxation', 'Transport', 'Product', 'Packing', 'Utilities', 'Fuel', 'Maintenance', 'Others');
ALTER TABLE "Expense" ALTER COLUMN "group" TYPE "ExpenseGroup_new" USING ("group"::text::"ExpenseGroup_new");
ALTER TYPE "ExpenseGroup" RENAME TO "ExpenseGroup_old";
ALTER TYPE "ExpenseGroup_new" RENAME TO "ExpenseGroup";
DROP TYPE "ExpenseGroup_old";
COMMIT;
