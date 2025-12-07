import { PrismaClient } from "../src/generated/client2/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.PPG_USER_DATABASE_URL2,
});

const getPrisma = () => new PrismaClient({
  adapter,
});

const globalForFlexiAdsDBPrismaClient = global as unknown as {
  flexiAdsDBPrismaClient: ReturnType<typeof getPrisma>;
};

export const flexiAdsDBPrismaClient =
  globalForFlexiAdsDBPrismaClient.flexiAdsDBPrismaClient || getPrisma();
if (process.env.NODE_ENV !== "production")
  globalForFlexiAdsDBPrismaClient.flexiAdsDBPrismaClient = flexiAdsDBPrismaClient;