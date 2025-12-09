-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('IMPRESSION', 'CLICK', 'VIEW');

-- CreateTable
CREATE TABLE "AdEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EventType" NOT NULL,
    "productId" INTEGER NOT NULL,
    "campaignId" INTEGER,

    CONSTRAINT "AdEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdEvent" ADD CONSTRAINT "AdEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEvent" ADD CONSTRAINT "AdEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BoostCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
