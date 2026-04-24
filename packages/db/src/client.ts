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
 */
export function getSecuredPrisma(tenantId: string) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // RLS için oturum bazlı tenant ayarı bir transaction içinde yapılmalıdır
          return basePrisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = $1`, tenantId);
            return query(args);
          });
        },
      },
    },
  });
}

// Geliştiricilerin yanlışlıkla korumasız prisma kullanmasını zorlaştırmak için 
// ana prisma instance'ını direkt dışa aktarmıyoruz.
