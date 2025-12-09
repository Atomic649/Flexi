/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Agency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Coach` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Office` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Orm` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BidStrategy" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Agency" DROP CONSTRAINT "Agency_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Agency" DROP CONSTRAINT "Agency_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Orm" DROP CONSTRAINT "Orm_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Orm" DROP CONSTRAINT "Orm_businessId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Agency";

-- DropTable
DROP TABLE "Bank";

-- DropTable
DROP TABLE "Coach";

-- DropTable
DROP TABLE "Office";

-- DropTable
DROP TABLE "Orm";

-- CreateTable
CREATE TABLE "CategoryDef" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CategoryDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "callToAction" TEXT,
    "businessId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDetail" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostCampaign" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget" DOUBLE PRECISION NOT NULL,
    "dailyCap" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bidStrategy" "BidStrategy" NOT NULL DEFAULT 'AUTO',
    "maxBid" DOUBLE PRECISION,
    "businessId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "BoostCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostResult" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "BoostResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostBidLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bidValue" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "BoostBidLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostSpendLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spend" DOUBLE PRECISION NOT NULL,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "BoostSpendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDef_name_key" ON "CategoryDef"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDetail" ADD CONSTRAINT "ProductDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostCampaign" ADD CONSTRAINT "BoostCampaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostCampaign" ADD CONSTRAINT "BoostCampaign_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostCampaign" ADD CONSTRAINT "BoostCampaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostResult" ADD CONSTRAINT "BoostResult_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BoostCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostBidLog" ADD CONSTRAINT "BoostBidLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BoostCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostSpendLog" ADD CONSTRAINT "BoostSpendLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BoostCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
