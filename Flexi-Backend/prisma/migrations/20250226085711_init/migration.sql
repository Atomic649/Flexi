/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `BusinessAcc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BusinessAcc_memberId_key" ON "BusinessAcc"("memberId");
