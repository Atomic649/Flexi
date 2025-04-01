/*
  Warnings:

  - You are about to drop the column `channal` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "channal",
ADD COLUMN     "channel" "Bank";
