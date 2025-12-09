/*
  Warnings:

  - Added the required column `userId` to the `AdEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdEvent" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL;
