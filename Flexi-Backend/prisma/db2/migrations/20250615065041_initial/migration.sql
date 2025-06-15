-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Office', 'Coach', 'Bank', 'Agency', 'Account', 'Orm');

-- CreateTable
CREATE TABLE "User" (
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
    "businessType" "Category" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessAcc" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BusinessAcc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Category" "Category" NOT NULL DEFAULT 'Office',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "callToAction" TEXT,
    "authorId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Category" "Category" NOT NULL DEFAULT 'Coach',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "callToAction" TEXT,
    "authorId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Category" "Category" NOT NULL DEFAULT 'Bank',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "callToAction" TEXT,
    "authorId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Category" "Category" NOT NULL DEFAULT 'Agency',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "callToAction" TEXT,
    "authorId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orm" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Category" "Category" NOT NULL DEFAULT 'Orm',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "callToAction" TEXT,
    "authorId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "Orm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BusinessMembers" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BusinessMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BusinessAccToOffice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BusinessAccToOffice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BusinessAccToCoach" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BusinessAccToCoach_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BusinessAccToOrm" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BusinessAccToOrm_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BankToBusinessAcc" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BankToBusinessAcc_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AgencyToBusinessAcc" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgencyToBusinessAcc_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "_BusinessMembers_B_index" ON "_BusinessMembers"("B");

-- CreateIndex
CREATE INDEX "_BusinessAccToOffice_B_index" ON "_BusinessAccToOffice"("B");

-- CreateIndex
CREATE INDEX "_BusinessAccToCoach_B_index" ON "_BusinessAccToCoach"("B");

-- CreateIndex
CREATE INDEX "_BusinessAccToOrm_B_index" ON "_BusinessAccToOrm"("B");

-- CreateIndex
CREATE INDEX "_BankToBusinessAcc_B_index" ON "_BankToBusinessAcc"("B");

-- CreateIndex
CREATE INDEX "_AgencyToBusinessAcc_B_index" ON "_AgencyToBusinessAcc"("B");

-- AddForeignKey
ALTER TABLE "BusinessAcc" ADD CONSTRAINT "BusinessAcc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orm" ADD CONSTRAINT "Orm_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessMembers" ADD CONSTRAINT "_BusinessMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessMembers" ADD CONSTRAINT "_BusinessMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOffice" ADD CONSTRAINT "_BusinessAccToOffice_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOffice" ADD CONSTRAINT "_BusinessAccToOffice_B_fkey" FOREIGN KEY ("B") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToCoach" ADD CONSTRAINT "_BusinessAccToCoach_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToCoach" ADD CONSTRAINT "_BusinessAccToCoach_B_fkey" FOREIGN KEY ("B") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOrm" ADD CONSTRAINT "_BusinessAccToOrm_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessAccToOrm" ADD CONSTRAINT "_BusinessAccToOrm_B_fkey" FOREIGN KEY ("B") REFERENCES "Orm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankToBusinessAcc" ADD CONSTRAINT "_BankToBusinessAcc_A_fkey" FOREIGN KEY ("A") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankToBusinessAcc" ADD CONSTRAINT "_BankToBusinessAcc_B_fkey" FOREIGN KEY ("B") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToBusinessAcc" ADD CONSTRAINT "_AgencyToBusinessAcc_A_fkey" FOREIGN KEY ("A") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgencyToBusinessAcc" ADD CONSTRAINT "_AgencyToBusinessAcc_B_fkey" FOREIGN KEY ("B") REFERENCES "BusinessAcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;
