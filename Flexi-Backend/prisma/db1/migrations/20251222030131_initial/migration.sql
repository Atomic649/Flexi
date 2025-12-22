/*
  Warnings:

  - Added the required column `platform` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_platformId_fkey";

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "platform" "SocialMedia" NOT NULL,
ALTER COLUMN "platformId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;
