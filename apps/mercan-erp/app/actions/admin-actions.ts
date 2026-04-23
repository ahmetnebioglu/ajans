"use server";

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";

// --- ŞİRKET YÖNETİMİ FONKSİYONLARI ---

export async function getCompanies() {
  return await db.company.findMany({
    include: {
      experts: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCompany(data: { name: string; taxNumber?: string; address?: string }) {
  const company = await db.company.create({
    data: {
      name: data.name,
      taxNumber: data.taxNumber,
      address: data.address,
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

export async function getExperts() {
  return await db.user.findMany({
    where: { role: "EXPERT" },
    select: { id: true, name: true, email: true },
  });
}

export async function getCompanyAccess(companyId: string) {
  const company = await db.company.findUnique({
    where: { id: companyId },
    include: { experts: true },
  });
  return company?.experts.map((e) => e.id) || [];
}

export async function toggleExpertAccess(companyId: string, expertId: string) {
  const company = await db.company.findUnique({
    where: { id: companyId },
    include: { experts: true },
  });

  const isLinked = company?.experts.some((e) => e.id === expertId);

  if (isLinked) {
    await db.company.update({
      where: { id: companyId },
      data: { experts: { disconnect: { id: expertId } } },
    });
  } else {
    await db.company.update({
      where: { id: companyId },
      data: { experts: { connect: { id: expertId } } },
    });
  }
  revalidatePath("/dashboard/companies");
  return { success: true };
}

// --- BİLDİRİM FONKSİYONLARI ---

export async function getNotifications() {
  try {
    return await db.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);
    return [];
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
