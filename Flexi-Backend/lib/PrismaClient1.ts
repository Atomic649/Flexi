import { PrismaClient } from "../src/generated/client1/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.PPG_USER_DATABASE_URL1,
});

const getPrisma = () => new PrismaClient({
  adapter,
});

const globalForFlexiDBPrismaClient = global as unknown as {
  flexiDBPrismaClient: ReturnType<typeof getPrisma>;
};

export const flexiDBPrismaClient =
  globalForFlexiDBPrismaClient.flexiDBPrismaClient || getPrisma();
if (process.env.NODE_ENV !== "production")
  globalForFlexiDBPrismaClient.flexiDBPrismaClient = flexiDBPrismaClient;