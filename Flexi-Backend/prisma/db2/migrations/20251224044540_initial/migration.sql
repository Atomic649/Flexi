-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "flexiadsdb";

-- CreateEnum
CREATE TYPE "flexiadsdb"."Category" AS ENUM ('Office', 'Coach', 'Bank', 'Agency', 'Account', 'Orm');

-- CreateEnum
CREATE TYPE "flexiadsdb"."BidStrategy" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "flexiadsdb"."CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "flexiadsdb"."EventType" AS ENUM ('IMPRESSION', 'CLICK', 'VIEW');

-- CreateTable
CREATE TABLE "flexiadsdb"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "username" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."Member" (
    "uniqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."BusinessAcc" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "businessType" "flexiadsdb"."Category" NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BusinessAcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."CategoryDef" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CategoryDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."Product" (
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
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."ProductDetail" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."BoostCampaign" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "status" "flexiadsdb"."CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget" DOUBLE PRECISION NOT NULL,
    "dailyCap" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bidStrategy" "flexiadsdb"."BidStrategy" NOT NULL DEFAULT 'AUTO',
    "maxBid" DOUBLE PRECISION,
    "businessId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "BoostCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."BoostResult" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "BoostResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."BoostBidLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bidValue" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "BoostBidLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."BoostSpendLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spend" DOUBLE PRECISION NOT NULL,
    "campaignId" INTEGER NOT NULL,

    CONSTRAINT "BoostSpendLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexiadsdb"."AdEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "flexiadsdb"."EventType" NOT NULL,
    "productId" INTEGER NOT NULL,
    "campaignId" INTEGER,
    "viewerId" TEXT NOT NULL,

    CONSTRAINT "AdEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "flexiadsdb"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "flexiadsdb"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "flexiadsdb"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDef_name_key" ON "flexiadsdb"."CategoryDef"("name");

-- AddForeignKey
ALTER TABLE "flexiadsdb"."Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "flexiadsdb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "flexiadsdb"."BusinessAcc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BusinessAcc" ADD CONSTRAINT "BusinessAcc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "flexiadsdb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "flexiadsdb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "flexiadsdb"."CategoryDef"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."Product" ADD CONSTRAINT "Product_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "flexiadsdb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."ProductDetail" ADD CONSTRAINT "ProductDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "flexiadsdb"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BoostCampaign" ADD CONSTRAINT "BoostCampaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "flexiadsdb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BoostCampaign" ADD CONSTRAINT "BoostCampaign_productId_fkey" FOREIGN KEY ("productId") REFERENCES "flexiadsdb"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BoostCampaign" ADD CONSTRAINT "BoostCampaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "flexiadsdb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BoostResult" ADD CONSTRAINT "BoostResult_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "flexiadsdb"."BoostCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BoostBidLog" ADD CONSTRAINT "BoostBidLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "flexiadsdb"."BoostCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."BoostSpendLog" ADD CONSTRAINT "BoostSpendLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "flexiadsdb"."BoostCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."AdEvent" ADD CONSTRAINT "AdEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "flexiadsdb"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexiadsdb"."AdEvent" ADD CONSTRAINT "AdEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "flexiadsdb"."BoostCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
