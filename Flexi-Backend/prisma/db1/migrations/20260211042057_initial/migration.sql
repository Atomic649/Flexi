-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "customerId" INTEGER;

-- CreateTable
CREATE TABLE "flexidb"."Customer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" "flexidb"."Gender",
    "email" TEXT,
    "address" TEXT,
    "province" TEXT,
    "postId" TEXT,
    "taxId" TEXT,
    "deleted" BOOLEAN DEFAULT false,
    "businessAcc" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_businessAcc_idx" ON "flexidb"."Customer"("businessAcc");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_businessAcc_phone_key" ON "flexidb"."Customer"("businessAcc", "phone");

-- AddForeignKey
ALTER TABLE "flexidb"."Customer" ADD CONSTRAINT "Customer_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Bill" ADD CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "flexidb"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
