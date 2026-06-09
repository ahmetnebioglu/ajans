import { getSecuredPrisma } from "@ajans/db";

// ERP uygulaması için varsayılan tenant bağlamı (mevcut veri modeli ile uyumlu)
export const db = getSecuredPrisma("mercan");
export const prisma = db;
