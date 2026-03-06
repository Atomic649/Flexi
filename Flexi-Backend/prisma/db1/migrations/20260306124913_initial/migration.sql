/*
  Warnings:

  - A unique constraint covering the columns `[flexiId]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - The required column `flexiId` was added to the `Bill` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "flexiId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bill_flexiId_key" ON "flexidb"."Bill"("flexiId");
