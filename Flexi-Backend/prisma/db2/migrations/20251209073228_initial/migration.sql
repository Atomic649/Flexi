/*
  Warnings:

  - You are about to drop the column `userId` on the `AdEvent` table. All the data in the column will be lost.
  - Added the required column `viewerId` to the `AdEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdEvent" DROP COLUMN "userId",
ADD COLUMN     "viewerId" TEXT NOT NULL;
