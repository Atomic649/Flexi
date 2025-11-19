/*
  Warnings:

  - You are about to alter the column `adsCost` on the `DailyMetrics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(14,2)`.
  - You are about to alter the column `profit` on the `DailyMetrics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(14,2)`.

*/
-- AlterTable
ALTER TABLE "DailyMetrics" ALTER COLUMN "sale" SET DEFAULT 0,
ALTER COLUMN "sale" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "adsCost" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "totalDiscount" SET DEFAULT 0,
ALTER COLUMN "totalDiscount" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "billLevelDiscount" SET DEFAULT 0,
ALTER COLUMN "billLevelDiscount" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "beforeDiscount" SET DEFAULT 0,
ALTER COLUMN "beforeDiscount" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "profit" SET DATA TYPE DECIMAL(14,2);

-- CreateTable
CREATE TABLE "MonthlyMetrics" (
    "id" SERIAL NOT NULL,
    "memberId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "sale" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "adsCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "billLevelDiscount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "beforeDiscount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "profit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyMetrics_memberId_idx" ON "MonthlyMetrics"("memberId");

-- CreateIndex
CREATE INDEX "MonthlyMetrics_month_idx" ON "MonthlyMetrics"("month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyMetrics_memberId_month_key" ON "MonthlyMetrics"("memberId", "month");
