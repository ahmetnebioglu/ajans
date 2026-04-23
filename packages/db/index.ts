import { PrismaClient } from "@prisma/client";
console.log("DATABASE MODULE LOADED - Version: 21:51");
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

export * from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  mercanPrisma: PrismaClient | undefined;
};

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.mercanPrisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.mercanPrisma = prisma;
