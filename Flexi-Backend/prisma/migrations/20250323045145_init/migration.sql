/*
  Warnings:

  - You are about to drop the column `imageBill` on the `Bill` table. All the data in the column will be lost.
  - Added the required column `image` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "imageBill",
ADD COLUMN     "image" TEXT NOT NULL;
