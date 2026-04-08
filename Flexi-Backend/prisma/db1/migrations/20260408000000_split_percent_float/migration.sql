-- AlterTable: change splitPercent and splitPercentMax from INTEGER to DOUBLE PRECISION to support decimal percentages
ALTER TABLE "flexidb"."Bill" ALTER COLUMN "splitPercent" TYPE DOUBLE PRECISION;
ALTER TABLE "flexidb"."Bill" ALTER COLUMN "splitPercentMax" TYPE DOUBLE PRECISION;
