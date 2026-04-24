import { getSecuredPrisma } from "@ajans/db";

// "ecommerce-hub" tenant bağlamı ile RLS korumalı Prisma instance'ı
export const db = getSecuredPrisma("ecommerce-hub");
export const prisma = db;
