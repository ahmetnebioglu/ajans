"use server";

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";

// --- ŞİRKET YÖNETİMİ FONKSİYONLARI ---

export async function getCompanies() {
  try {
    return {
      success: true,
      companies: await db.company.findMany({
        include: {
          experts: true,
          _count: {
            select: { 
              reports: true,
              userAccess: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
      })
    };
  } catch (error) {
    return { success: false, error: "Şirketler yüklenemedi." };
  }
}

export async function getCompanyById(id: string) {
  try {
    return await db.company.findUnique({
      where: { id },
      include: {
        experts: true,
        reports: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch (error) {
    return null;
  }
}

export async function createCompany(data: { name: string; taxNumber?: string; address?: string; driveFolderId?: string }) {
  const company = await db.company.create({
    data: {
      name: data.name,
      taxNumber: data.taxNumber,
      address: data.address,
      driveFolderId: data.driveFolderId,
    },
  });
  revalidatePath("/dashboard/companies");
  return company;
}

export async function deleteCompany(id: string) {
  await db.company.delete({ where: { id } });
  revalidatePath("/dashboard/companies");
  return { success: true };
}

// --- KULLANICI YÖNETİMİ FONKSİYONLARI ---

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      include: {
        companyAccess: {
          include: {
            company: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, users };
  } catch (error) {
    console.error("GET_ALL_USERS_ERROR:", error);
    return { success: false, error: "Kullanıcılar yüklenemedi." };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { role: role as any }
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Rol güncellenemedi." };
  }
}

export async function toggleExpertAccess(userId: string, companyId: string, hasAccess: boolean) {
  try {
    if (hasAccess) {
      await db.companyAccess.create({
        data: { userId, companyId }
      });
    } else {
      await db.companyAccess.delete({
        where: {
          userId_companyId: { userId, companyId }
        }
      });
    }
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erişim güncellenemedi." };
  }
}

// --- BİLDİRİM FONKSİYONLARI ---

export async function getNotifications() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return { success: true, notifications };
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);
    return { success: false, notifications: [] };
  }
}

export async function markNotificationsAsRead() {
  try {
    await db.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("MARK_NOTIFICATIONS_READ_ERROR:", error);
    return { success: false };
  }
}

// --- GELEN TALEPLER (CMS) FONKSİYONLARI ---

export async function markRequestAsRead(id: string, type: "contact" | "reference") {
  try {
    if (type === "contact") {
      await db.contactMessage.update({
        where: { id },
        data: { isRead: true },
      });
    } else {
      await db.referenceRequest.update({
        where: { id },
        data: { isRead: true },
      });
    }
    revalidatePath("/dashboard/cms/talepler");
    return { success: true };
  } catch (error) {
    console.error("MARK_AS_READ_ERROR:", error);
    return { success: false };
  }
}

export async function markRequestAsUnread(id: string, type: "contact" | "reference") {
  try {
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
  } catch (error) {
    console.error("MARK_AS_UNREAD_ERROR:", error);
    return { success: false };
  }
}

// --- RAPOR YÖNETİMİ FONKSİYONLARI ---

export async function getReports(query: string = "", sort: string = "createdAt", dir: "asc" | "desc" = "desc") {
  try {
    const reports = await db.report.findMany({
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
    return { success: true, reports };
  } catch (error) {
    console.error("GET_REPORTS_ERROR:", error);
    return { success: false, error: "Raporlar yüklenemedi." };
  }
}

export async function updateReportStatus(id: string, status: string) {
  try {
    await db.report.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/reports");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Durum güncellenemedi." };
  }
}

export async function bulkUpdateReportStatus(ids: string[], status: string) {
  try {
    await db.report.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    revalidatePath("/dashboard/reports");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function bulkDeleteReports(ids: string[]) {
  try {
    await db.report.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath("/dashboard/reports");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getExperts() {
  try {
    const experts = await db.user.findMany({
      where: { role: "EXPERT" },
      select: { id: true, name: true, email: true },
    });
    return { success: true, experts };
  } catch (error) {
    return { success: false, error: "Uzmanlar yüklenemedi." };
  }
}

// --- MESAJ YÖNETİMİ FONKSİYONLARI ---

export async function getMessages() {
  try {
    const contactMessages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    const referenceRequests = await db.referenceRequest.findMany({ orderBy: { createdAt: "desc" } });
    
    // Normalize and combine
    const all = [
      ...contactMessages.map(m => ({ ...m, type: "contact" })),
      ...referenceRequests.map(m => ({ ...m, type: "reference", subject: "Referans Talebi" }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return all;
  } catch (error) {
    console.error("GET_MESSAGES_ERROR:", error);
    return [];
  }
}

export async function deleteMessage(id: string, type: "contact" | "reference") {
  try {
    if (type === "contact") {
      await db.contactMessage.delete({ where: { id } });
    } else {
      await db.referenceRequest.delete({ where: { id } });
    }
    revalidatePath("/dashboard/cms/messages");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getCompanyDetails(companyId: string, folderId: string | null = null) {
  try {
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        reports: {
          where: { folderId: folderId || null },
          include: { uploadedBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" }
        },
        folders: true, // All folders to build tree
      }
    });

    if (!company) return { success: false, error: "Firma bulunamadı" };

    let currentFolderName = "Kök Dizin";
    if (folderId) {
      const folder = await db.folder.findUnique({ where: { id: folderId } });
      if (folder) currentFolderName = folder.name;
    }

    return { success: true, company, currentFolderName };
  } catch (error) {
    console.error("GET_COMPANY_DETAILS_ERROR:", error);
    return { success: false, error: "Detaylar yüklenemedi" };
  }
}

export async function createFolder(name: string, companyId: string, parentId: string | null = null) {
  try {
    await db.folder.create({
      data: { name, companyId, parentId }
    });
    revalidatePath(`/dashboard/companies/${companyId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function moveReport(reportId: string, targetFolderId: string | null) {
  try {
    const report = await db.report.update({
      where: { id: reportId },
      data: { folderId: targetFolderId },
      include: { company: true }
    });
    revalidatePath(`/dashboard/companies/${report.companyId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function logPdfGeneration(companyId: string, companyName: string) {
  try {
    await db.notification.create({
      data: {
        userId: null, // System notification
        message: `${companyName} firması için PDF rapor oluşturuldu.`,
        type: "SUCCESS"
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
export async function getCompanyAccess(companyId: string) {
  try {
    const access = await db.companyAccess.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
    return { success: true, access };
  } catch (error) {
    return { success: false, error: "Erişim listesi yüklenemedi" };
  }
}
