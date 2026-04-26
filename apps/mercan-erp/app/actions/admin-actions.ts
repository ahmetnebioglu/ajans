"use server";

import { revalidatePath } from "next/cache";
import { protectedAction } from "@ajans/core/server";
import { unsecured_prisma } from "@ajans/db";

// --- ŞİRKET YÖNETİMİ FONKSİYONLARI ---

export async function getCompanies() {
  return protectedAction(async ({ db }) => {
    return await db.company.findMany({
      include: {
        experts: true,
        _count: {
          select: {
            reports: true,
            userAccess: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function getCompanyById(id: string) {
  return protectedAction(async ({ db }) => {
    return await db.company.findUnique({
      where: { id },
      include: {
        experts: true,
        reports: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });
}

export async function createCompany(data: {
  name: string;
  taxNumber?: string;
  address?: string;
  driveFolderId?: string;
}) {
  return protectedAction(async ({ db, tenantId }) => {
    const company = await db.$transaction(async (tx) => {
      const created = await tx.company.create({
        data: {
          name: data.name,
          taxNumber: data.taxNumber,
          address: data.address,
          driveFolderId: data.driveFolderId,
          tenantId,
        },
      });
      return created;
    });
    revalidatePath("/dashboard/companies");
    return company;
  });
}

export async function deleteCompany(id: string) {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      await tx.company.delete({ where: { id } });
    });
    revalidatePath("/dashboard/companies");
    return { success: true };
  });
}

// --- KULLANICI YÖNETİMİ FONKSİYONLARI ---

export async function getAllUsers() {
  return protectedAction(async ({ db, tenantId }) => {
    return await db.user.findMany({
      where: { tenantId },
      include: {
        companyAccess: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function updateUserRole(userId: string, role: string) {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: role as any },
      });
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  });
}

export async function toggleExpertAccess(
  userId: string,
  companyId: string,
  hasAccess: boolean,
) {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      if (hasAccess) {
        await tx.companyAccess.create({
          data: { userId, companyId },
        });
      } else {
        await tx.companyAccess.delete({
          where: {
            userId_companyId: { userId, companyId },
          },
        });
      }
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  });
}

// --- BİLDİRİM FONKSİYONLARI ---

export async function getNotifications() {
  return protectedAction(async ({ db }) => {
    return await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  });
}

export async function markNotificationsAsRead() {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      await tx.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    });
    revalidatePath("/dashboard");
    return { success: true };
  });
}

// --- GELEN TALEPLER (CMS) FONKSİYONLARI ---

export async function markRequestAsRead(id: string, type: "contact" | "reference") {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      if (type === "contact") {
        await tx.contactMessage.update({
          where: { id },
          data: { isRead: true },
        });
      } else {
        await tx.referenceRequest.update({
          where: { id },
          data: { isRead: true },
        });
      }
    });
    revalidatePath("/dashboard/cms/talepler");
    return { success: true };
  });
}

export async function markRequestAsUnread(
  id: string,
  type: "contact" | "reference",
) {
  return protectedAction(async ({ db }) => {
    if (type === "contact") {
      await db.contactMessage.update({
        where: { id },
        data: { isRead: false },
      });
    } else {
      await db.referenceRequest.update({
        where: { id },
        data: { isRead: false },
      });
    }
    revalidatePath("/dashboard/cms/talepler");
    return { success: true };
  });
}

// --- RAPOR YÖNETİMİ FONKSİYONLARI ---

export async function getReports(
  query: string = "",
  sort: string = "createdAt",
  dir: "asc" | "desc" = "desc",
) {
  return protectedAction(async ({ db }) => {
    return await db.report.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { company: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        company: true,
      },
      orderBy: {
        [sort]: dir,
      },
    });
  });
}

export async function updateReportStatus(id: string, status: string) {
  return protectedAction(async ({ db, user, tenantId }) => {
    await db.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id: id },
        data: { status },
      });

      // Audit Log Kaydı
      await tx.auditLog.create({
        data: {
          action: "STATUS_CHANGE",
          details: `${updated.title} isimli raporun durumu ${status} olarak güncellendi.`,
          companyId: updated.companyId || null,
          userId: (user as any).id || null,
          tenantId: tenantId || "mercan",
        }
      });
    });
    revalidatePath("/dashboard/reports");
    return { success: true };
  });
}

export async function bulkUpdateReportStatus(ids: string[], status: string) {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      await tx.report.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });
    });
    revalidatePath("/dashboard/reports");
    return { success: true };
  });
}

export async function bulkDeleteReports(ids: string[]) {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      await tx.report.deleteMany({
        where: { id: { in: ids } },
      });
    });
    revalidatePath("/dashboard/reports");
    return { success: true };
  });
}

export async function getExperts() {
  return protectedAction(async ({ db, tenantId }) => {
    return await db.user.findMany({
      where: { role: "EXPERT", tenantId },
      select: { id: true, name: true, email: true },
    });
  });
}

// --- MESAJ YÖNETİMİ FONKSİYONLARI ---

export async function getMessages() {
  return protectedAction(async ({ db }) => {
    const contactMessages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    const referenceRequests = await db.referenceRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    const all = [
      ...contactMessages.map((m) => ({ ...m, type: "contact" })),
      ...referenceRequests.map((m) => ({
        ...m,
        type: "reference",
        subject: "Referans Talebi",
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return all;
  });
}

export async function deleteMessage(id: string, type: "contact" | "reference") {
  return protectedAction(async ({ db }) => {
    await db.$transaction(async (tx) => {
      if (type === "contact") {
        await tx.contactMessage.delete({ where: { id } });
      } else {
        await tx.referenceRequest.delete({ where: { id } });
      }
    });
    revalidatePath("/dashboard/cms/messages");
    return { success: true };
  });
}

export async function getCompanyDetails(
  companyId: string,
  folderId: string | null = null,
) {
  return protectedAction(async ({ db }) => {
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        reports: {
          where: { folderId: folderId || null },
          include: { uploadedBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        folders: true,
      },
    });

    if (!company) throw new Error("Firma bulunamadı");

    let currentFolderName = "Kök Dizin";
    if (folderId) {
      const folder = await db.folder.findUnique({ where: { id: folderId } });
      if (folder) currentFolderName = folder.name;
    }

    return { company, currentFolderName };
  });
}

export async function createFolder(
  name: string,
  companyId: string,
  parentId: string | null = null,
) {
  console.log(`>>> [Action:createFolder] Name: ${name}, CompanyId: ${companyId}`);
  return protectedAction(async ({ db, user, tenantId }) => {
    console.log(`>>> [Action:createFolder] Inside protectedAction. TenantId: ${tenantId}`);
    await db.$transaction(async (tx) => {
      await tx.folder.create({
        data: { 
          name, 
          companyId, 
          parentId: parentId || null,
          tenantId: tenantId || "mercan",
        },
      });
      
      // Audit Log Kaydı
      await tx.auditLog.create({
        data: {
          action: "CREATED_FOLDER",
          details: `${name} isimli klasör oluşturuldu.`,
          companyId: companyId || null,
          userId: (user as any).id || null,
          tenantId: tenantId || "mercan",
        }
      });
    });
    revalidatePath(`/dashboard/companies/${companyId}`);
    return { success: true };
  });
}

export async function moveReport(
  reportId: string,
  targetFolderId: string | null,
) {
  return protectedAction(async ({ db, user, tenantId }) => {
    const report = await db.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id: reportId },
        data: { folderId: targetFolderId || null },
        include: { company: true, folder: true },
      });

      // Audit Log Kaydı
      await tx.auditLog.create({
        data: {
          action: "MOVED",
          details: `${updated.title} isimli rapor ${updated.folder?.name || "Kök Dizin"} konumuna taşındı.`,
          companyId: updated.companyId || null,
          userId: (user as any).id || null,
          tenantId: tenantId || "mercan",
        }
      });

      return updated;
    });
    revalidatePath(`/dashboard/companies/${report.companyId}`);
    return { success: true };
  });
}

export async function logPdfGeneration(companyId: string, companyName: string) {
  return protectedAction(async ({ db, user, tenantId }) => {
    await db.$transaction(async (tx) => {
      await tx.notification.create({
        data: {
          userId: user.id, 
          message: `${companyName} firması için PDF rapor oluşturuldu.`,
          type: "SUCCESS",
        },
      });

      // Audit Log Kaydı
      await tx.auditLog.create({
        data: {
          action: "PDF_GENERATE",
          details: `${companyName} firması için sistemden denetim raporu (PDF) oluşturuldu.`,
          companyId: companyId || null,
          userId: (user as any).id || null,
          tenantId: tenantId || "mercan",
        }
      });
    });
    return { success: true };
  });
}

export async function getCompanyAccess(companyId: string) {
  return protectedAction(async ({ db }) => {
    return await db.companyAccess.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  });
}

export async function getAuditLogs() {
  return protectedAction(async ({ db, tenantId }) => {
    return await db.auditLog.findMany({
      where: { tenantId },
      include: {
        user: { select: { name: true, email: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Sayfa performansı için son 100 kaydı alalım
    });
  });
}
