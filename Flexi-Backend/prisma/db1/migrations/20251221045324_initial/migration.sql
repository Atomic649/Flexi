/*
  Warnings:

  - A unique constraint covering the columns `[campaignId]` on the table `Platform` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `Platform` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "campaignId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Platform_campaignId_key" ON "Platform"("campaignId");
