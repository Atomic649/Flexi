-- AlterTable
ALTER TABLE "flexidb"."User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerifyToken" TEXT,
ADD COLUMN     "emailVerifyTokenExpiry" TIMESTAMP(3);
