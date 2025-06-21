-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Orm" ADD COLUMN     "delete" BOOLEAN NOT NULL DEFAULT false;
