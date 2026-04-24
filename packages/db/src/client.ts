import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
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
          // RLS için oturum bazlı tenant ayarı bir transaction içinde yapılmalıdır
          return basePrisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant', $1, true)`, tenantId);
            return query(args);
          });
        },
      },
    },
  });
}

// Geliştiricilerin yanlışlıkla korumasız prisma kullanmasını zorlaştırmak için 
// ana prisma instance'ını direkt dışa aktarmıyoruz, ancak sistem seviyesindeki
// işlemler (Auth vb.) için basePrisma'yı dışa aktarıyoruz.
export { basePrisma as unsecured_prisma };
