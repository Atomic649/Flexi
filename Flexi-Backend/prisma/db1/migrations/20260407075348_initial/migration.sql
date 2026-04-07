-- AlterTable
ALTER TABLE "flexidb"."Bill" ADD COLUMN     "branch" TEXT DEFAULT 'Head Office';

-- AlterTable
ALTER TABLE "flexidb"."Customer" ADD COLUMN     "branch" TEXT DEFAULT 'Head Office',
ADD COLUMN     "taxType" "flexidb"."taxType" DEFAULT 'Individual';
