/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bill_memberId_key" ON "Bill"("memberId");
