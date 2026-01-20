-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "flexidb";

-- CreateEnum
CREATE TYPE "flexidb"."Unit" AS ENUM ('Piece', 'Hour', 'Course', 'List', 'Box', 'Pack', 'Set', 'Dozen', 'NotSpecified');

-- CreateEnum
CREATE TYPE "flexidb"."UserRole" AS ENUM ('owner', 'marketing', 'accountant', 'sales', 'partner');

-- CreateEnum
CREATE TYPE "flexidb"."taxType" AS ENUM ('Juristic', 'Individual');

-- CreateEnum
CREATE TYPE "flexidb"."Gender" AS ENUM ('Female', 'Male', 'NotSpecified');

-- CreateEnum
CREATE TYPE "flexidb"."Payment" AS ENUM ('COD', 'Transfer', 'CreditCard', 'Cash', 'NotSpecified');

-- CreateEnum
CREATE TYPE "flexidb"."SocialMedia" AS ENUM ('Facebook', 'Line', 'Tiktok', 'Shopee', 'Lazada', 'Instagram', 'X', 'Youtube', 'Google', 'Offline');

-- CreateEnum
CREATE TYPE "flexidb"."Bank" AS ENUM ('SCB', 'KBANK', 'KTB', 'BBL', 'TMB');

-- CreateEnum
CREATE TYPE "flexidb"."BusinessType" AS ENUM ('OnlineSale', 'Massage', 'Restaurant', 'Bar', 'Cafe', 'Rental', 'Tutor', 'Influencer', 'Other');

-- CreateEnum
CREATE TYPE "flexidb"."MediaType" AS ENUM ('VIDEO', 'IMAGE');

-- CreateEnum
CREATE TYPE "flexidb"."ReactionType" AS ENUM ('CREDIT', 'SPARK', 'DISCREDIT');

-- CreateEnum
CREATE TYPE "flexidb"."Category" AS ENUM ('Loan', 'Coaching', 'OEM', 'MarketingAgency', 'Packaging', 'accountant', 'Inventory');

-- CreateEnum
CREATE TYPE "flexidb"."ProductType" AS ENUM ('Service', 'Product', 'Rental');

-- CreateEnum
CREATE TYPE "flexidb"."OptionName" AS ENUM ('Size', 'Color', 'Material', 'Flavor', 'CreditLimit', 'QuantityLimit');

-- CreateEnum
CREATE TYPE "flexidb"."DocumentType" AS ENUM ('Invoice', 'Receipt', 'Quotation', 'DebitNote', 'CreditNote', 'WithholdingTax');

-- CreateEnum
CREATE TYPE "flexidb"."ExpenseStatus" AS ENUM ('Pass', 'Fail', 'Warning');

-- CreateEnum
CREATE TYPE "flexidb"."ExpenseGroup" AS ENUM ('Employee', 'Freelancer', 'Office', 'OfficeRental', 'CarRental', 'Commission', 'Advertising', 'Marketing', 'Copyright', 'Dividend', 'Interest', 'Influencer', 'Accounting', 'Legal', 'Taxation', 'Transport', 'Product', 'Packing', 'Utilities', 'Fuel', 'Maintenance', 'Others');

-- CreateTable
CREATE TABLE "flexidb"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "emailVerifyToken" TEXT,
    "emailVerifyTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."Member" (
    "uniqueId" TEXT NOT NULL,
    "role" "flexidb"."UserRole" NOT NULL DEFAULT 'owner',
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("uniqueId")
);

-- CreateTable
CREATE TABLE "flexidb"."BusinessAcc" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "businessName" TEXT NOT NULL,
    "businessUserName" TEXT,
    "businessAvatar" TEXT,
    "businessAddress" TEXT,
    "businessWebsite" TEXT,
    "businessPhone" TEXT,
    "vat" BOOLEAN DEFAULT false,
    "taxId" TEXT NOT NULL,
    "businessType" "flexidb"."BusinessType" NOT NULL DEFAULT 'OnlineSale',
    "taxType" "flexidb"."taxType" NOT NULL DEFAULT 'Individual',
    "userId" INTEGER NOT NULL,
    "memberId" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "DocumentType" "flexidb"."DocumentType"[] DEFAULT ARRAY['Receipt']::"flexidb"."DocumentType"[],

    CONSTRAINT "BusinessAcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."DocumentCounter" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "documentType" "flexidb"."DocumentType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DocumentCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."Bill" (
    "id" SERIAL NOT NULL,
    "billId" TEXT,
    "quotationId" TEXT,
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cName" TEXT NOT NULL,
    "cLastName" TEXT,
    "cPhone" TEXT,
    "cGender" "flexidb"."Gender",
    "cAddress" TEXT,
    "cProvince" TEXT,
    "cPostId" TEXT,
    "cTaxId" TEXT,
    "payment" "flexidb"."Payment",
    "total" INTEGER NOT NULL,
    "totalQuotation" INTEGER,
    "beforeDiscount" INTEGER,
    "purchaseAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashStatus" BOOLEAN DEFAULT false,
    "image" TEXT,
    "deleted" BOOLEAN DEFAULT false,
    "repeat" BOOLEAN DEFAULT false,
    "repeatMonths" INTEGER DEFAULT 0,
    "note" TEXT,
    "taxType" "flexidb"."taxType" DEFAULT 'Individual',
    "DocumentType" "flexidb"."DocumentType" DEFAULT 'Receipt',
    "discount" INTEGER DEFAULT 0,
    "billLevelDiscount" INTEGER DEFAULT 0,
    "priceValid" TIMESTAMP(3),
    "validContactUntil" TIMESTAMP(3),
    "rentalStockReleased" BOOLEAN NOT NULL DEFAULT false,
    "paymentTermCondition" TEXT,
    "remark" TEXT,
    "platform" "flexidb"."SocialMedia" NOT NULL,
    "memberId" TEXT NOT NULL,
    "businessAcc" INTEGER NOT NULL,
    "platformId" INTEGER,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."ProductItem" (
    "id" SERIAL NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "unitDiscount" INTEGER DEFAULT 0,
    "billId" INTEGER,
    "unit" "flexidb"."Unit",

    CONSTRAINT "ProductItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."AdsCost" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adsCost" DECIMAL(65,30) NOT NULL,
    "memberId" TEXT NOT NULL,
    "platformId" INTEGER NOT NULL,
    "product" TEXT NOT NULL,
    "businessAcc" INTEGER NOT NULL,

    CONSTRAINT "AdsCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."Expense" (
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "expNo" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "group" "flexidb"."ExpenseGroup",
    "image" TEXT,
    "pdf" TEXT,
    "note" TEXT,
    "desc" TEXT,
    "deleted" BOOLEAN DEFAULT false,
    "save" BOOLEAN DEFAULT false,
    "channel" "flexidb"."Bank",
    "code" TEXT,
    "vat" BOOLEAN DEFAULT false,
    "vatAmount" DECIMAL(65,30) DEFAULT 0,
    "withHoldingTax" BOOLEAN DEFAULT false,
    "WHTpercent" DECIMAL(65,30) DEFAULT 0,
    "WHTAmount" DECIMAL(65,30) DEFAULT 0,
    "sName" TEXT,
    "sTaxId" TEXT,
    "sAddress" TEXT,
    "taxInvoiceNo" TEXT,
    "branch" TEXT,
    "taxType" "flexidb"."taxType" DEFAULT 'Individual',
    "status" "flexidb"."ExpenseStatus",
    "businessAcc" INTEGER NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."Platform" (
    "id" SERIAL NOT NULL,
    "platform" "flexidb"."SocialMedia" NOT NULL,
    "accName" TEXT NOT NULL,
    "accId" TEXT,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessAcc" INTEGER NOT NULL,
    "memberId" TEXT NOT NULL,
    "productId" INTEGER,
    "deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "flexidb"."Unit",
    "productType" "flexidb"."ProductType" DEFAULT 'Product',
    "description" TEXT,
    "barcode" TEXT,
    "image" TEXT,
    "stock" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "memberId" TEXT NOT NULL,
    "statusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    "businessAcc" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."ChatSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."ChatMessage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" JSONB NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flexidb"."PlatformToken" (
    "id" SERIAL NOT NULL,
    "platform" "flexidb"."SocialMedia" NOT NULL,
    "memberId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "flexidb"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "flexidb"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "flexidb"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAcc_businessName_key" ON "flexidb"."BusinessAcc"("businessName");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAcc_businessUserName_key" ON "flexidb"."BusinessAcc"("businessUserName");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAcc_taxId_key" ON "flexidb"."BusinessAcc"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCounter_businessId_documentType_key" ON "flexidb"."DocumentCounter"("businessId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_campaignId_key" ON "flexidb"."Platform"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "flexidb"."Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformToken_token_key" ON "flexidb"."PlatformToken"("token");

-- AddForeignKey
ALTER TABLE "flexidb"."Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "flexidb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Member" ADD CONSTRAINT "Member_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."BusinessAcc" ADD CONSTRAINT "BusinessAcc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "flexidb"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."DocumentCounter" ADD CONSTRAINT "DocumentCounter_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Bill" ADD CONSTRAINT "Bill_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Bill" ADD CONSTRAINT "Bill_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Bill" ADD CONSTRAINT "Bill_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "flexidb"."Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."ProductItem" ADD CONSTRAINT "ProductItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "flexidb"."Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."ProductItem" ADD CONSTRAINT "ProductItem_product_fkey" FOREIGN KEY ("product") REFERENCES "flexidb"."Product"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."AdsCost" ADD CONSTRAINT "AdsCost_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."AdsCost" ADD CONSTRAINT "AdsCost_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "flexidb"."Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."AdsCost" ADD CONSTRAINT "AdsCost_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."AdsCost" ADD CONSTRAINT "AdsCost_product_fkey" FOREIGN KEY ("product") REFERENCES "flexidb"."Product"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Expense" ADD CONSTRAINT "Expense_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Expense" ADD CONSTRAINT "Expense_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Platform" ADD CONSTRAINT "Platform_productId_fkey" FOREIGN KEY ("productId") REFERENCES "flexidb"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Platform" ADD CONSTRAINT "Platform_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Platform" ADD CONSTRAINT "Platform_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Product" ADD CONSTRAINT "Product_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Product" ADD CONSTRAINT "Product_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "flexidb"."ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."PlatformToken" ADD CONSTRAINT "PlatformToken_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
