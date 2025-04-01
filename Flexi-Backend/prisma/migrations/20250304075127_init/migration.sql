-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "DetectPDF" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pdf" TEXT NOT NULL,
    "bankNo" TEXT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "DetectPDF_pkey" PRIMARY KEY ("id")
);
