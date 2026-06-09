"use server";

import { protectedAction } from "@ajans/core/server";

/**
 * Filtrelenebilir Sistem Günlüğü (Audit Logs) getirir
 */
export async function getAuditLogs(query?: string) {
  return protectedAction(async ({ db }) => {
    const logs = await db.auditLog.findMany({
      where: query ? {
        OR: [
          { details: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { workspace: { name: { contains: query, mode: 'insensitive' } } },
          { action: { contains: query, mode: 'insensitive' } }
        ]
      } : {},
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        workspace: { select: { name: true } }
      }
    });

    return { success: true, logs };
  });
}
