"use server";

import { prisma } from "@ajans/db";

/**
 * Filtrelenebilir Sistem Günlüğü (Audit Logs) getirir
 */
export async function getAuditLogs(query?: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: query ? {
        OR: [
          { details: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { company: { name: { contains: query, mode: 'insensitive' } } },
          { action: { contains: query, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        company: { select: { name: true } }
      }
    });

    return { success: true, logs };
  } catch (error) {
    console.error("Audit log hiyerarşi hatası:", error);
    return { success: false, error: "Günlük kayıtları alınamadı." };
  }
}
