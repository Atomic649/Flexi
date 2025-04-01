-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Inbox" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "deleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "deleted" BOOLEAN DEFAULT false;
