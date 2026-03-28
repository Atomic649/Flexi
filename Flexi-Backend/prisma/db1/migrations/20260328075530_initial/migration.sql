-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "projectId" INTEGER;

-- AlterTable
ALTER TABLE "flexidb"."Expense" ADD COLUMN     "projectId" INTEGER;

-- CreateTable
CREATE TABLE "flexidb"."Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    "businessAcc" INTEGER NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flexidb"."Bill" ADD CONSTRAINT "Bill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "flexidb"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "flexidb"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Project" ADD CONSTRAINT "Project_businessAcc_fkey" FOREIGN KEY ("businessAcc") REFERENCES "flexidb"."BusinessAcc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flexidb"."Project" ADD CONSTRAINT "Project_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "flexidb"."Member"("uniqueId") ON DELETE RESTRICT ON UPDATE CASCADE;
