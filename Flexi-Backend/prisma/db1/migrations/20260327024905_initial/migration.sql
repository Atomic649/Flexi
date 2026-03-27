-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "isSplitChild" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "splitGroupId" TEXT;
