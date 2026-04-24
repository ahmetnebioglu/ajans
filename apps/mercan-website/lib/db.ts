import { getSecuredPrisma } from "@ajans/db";

// "mercan" tenant bağlamı ile RLS korumalı Prisma instance'ı
export const db = getSecuredPrisma("mercan");
export const prisma = db; // Geriye dönük uyumluluk için (bazı yerlerde prisma adıyla import ediliyor)

