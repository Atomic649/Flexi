/*
  Warnings:

  - The values [piece,hour,course,list,box,pack,set,dozen] on the enum `Unit` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Unit_new" AS ENUM ('Piece', 'Hour', 'Course', 'List', 'Box', 'Pack', 'Set', 'Dozen');
ALTER TABLE "Product" ALTER COLUMN "unit" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "unit" TYPE "Unit_new" USING ("unit"::text::"Unit_new");
ALTER TYPE "Unit" RENAME TO "Unit_old";
ALTER TYPE "Unit_new" RENAME TO "Unit";
DROP TYPE "Unit_old";
ALTER TABLE "Product" ALTER COLUMN "unit" SET DEFAULT 'Piece';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "unit" SET DEFAULT 'Piece';
