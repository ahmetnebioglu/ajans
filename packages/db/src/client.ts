import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// Çevresel değişkenlerin (özellikle DATABASE_URL) yüklendiğinden emin ol
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ 
  connectionString,
  max: 20, // Increase pool size to handle RLS transaction overhead
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

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
          await basePrisma.$executeRawUnsafe(`SELECT set_config('app.current_tenant', $1, true)`, tenantId);
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
