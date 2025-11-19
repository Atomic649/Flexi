-- CreateTable
CREATE TABLE "DailyMetrics" (
    "id" SERIAL NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "sale" INTEGER NOT NULL DEFAULT 0,
    "adsCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalDiscount" INTEGER NOT NULL DEFAULT 0,
    "billLevelDiscount" INTEGER NOT NULL DEFAULT 0,
    "beforeDiscount" INTEGER NOT NULL DEFAULT 0,
    "profit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyMetrics_memberId_idx" ON "DailyMetrics"("memberId");

-- CreateIndex
CREATE INDEX "DailyMetrics_date_idx" ON "DailyMetrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMetrics_memberId_date_key" ON "DailyMetrics"("memberId", "date");
