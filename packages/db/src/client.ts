import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Çevresel değişkenlerin yüklendiğinden emin ol
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  console.warn(">>> [DBClient] DATABASE_URL is not set. Using fallback for local development.");
}

// Windows'ta 'localhost' yerine '127.0.0.1' kullanımı daha stabildir (IPv6 çakışmalarını önler)
const connectionString = (rawUrl || "postgresql://root:rootpassword@127.0.0.1:5433/agency_master_db?schema=public").replace("localhost", "127.0.0.1");

const pool = new pg.Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

// Global tip tanımı
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

/**
 * RLS (Row Level Security) korumalı Prisma instance'ı döner.
 * Her işlemden önce 'app.current_tenant' değerini PostgreSQL oturumuna set eder.
 *
 * ÖNEMLİ (Faz 2 - Caching):
 * Bu client ile veri çekerken (findMany, findUnique vb.), Next.js önbellek mekanizmalarında
 * mutlaka '@ajans/core' paketindeki 'getTenantCacheTag(tenantId, resource)' kullanılmalıdır.
 * Aksi takdirde farklı müşterilerin verileri aynı önbellek slotuna sızabilir.
 */
export function getSecuredPrisma(tenantId: string) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // RLS Session Context Set
          await basePrisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
          return query(args);
        },
      },
    },
  });
}

// Geliştiricilerin yanlışlıkla korumasız prisma kullanmasını zorlaştırmak için
// ana prisma instance'ını direkt dışa aktarmıyoruz, ancak sistem seviyesindeki
// işlemler (Auth vb.) için basePrisma'yı dışa aktarıyoruz.
export { basePrisma as unsecured_prisma };
