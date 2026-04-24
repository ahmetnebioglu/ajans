import { getSecuredPrisma } from "@ajans/db";

// "okul-erp" tenant bağlamı ile RLS korumalı Prisma instance'ı
export const db = getSecuredPrisma("okul-erp");
export const prisma = db;
