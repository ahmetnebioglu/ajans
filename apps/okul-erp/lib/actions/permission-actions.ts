"use server";

import { getSecuredPrisma } from "@ajans/db";
import { revalidateTenantCache } from "@ajans/core";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
import { revalidatePath } from "next/cache";

// Okul ERP için varsayılan tenantId. 
// Gerçek bir SaaS senaryosunda bu kullanıcının bağlı olduğu okul ID'si olmalıdır.
const TENANT_ID = "okul-erp";

async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Yetkisiz erişim. Lütfen giriş yapın.");
  }
  return session;
}

/**
 * Yeni bir izin talebi oluşturur (Veli tarafından).
 */
export async function createPermissionRequest(data: {
  studentId: string;
  type: string;
  reason: string;
  date: Date;
}) {
  const session = await getAuthSession();
  const db = getSecuredPrisma(TENANT_ID);

  // Veli yetkisi kontrolü (Opsiyonel: Velinin bu öğrenciye erişimi var mı kontrolü eklenebilir)
  
  const request = await db.permissionRequest.create({
    data: {
      studentId: data.studentId,
      requestedById: (session.user as any).id,
      type: data.type,
      reason: data.reason,
      date: data.date,
      status: "PENDING",
      tenantId: TENANT_ID,
    },
  });

  revalidateTenantCache(TENANT_ID, "permissions");
  revalidatePath("/dashboard");
  
  return { success: true, request };
}

/**
 * Onay bekleyen tüm talepleri getirir (İdareci/Öğretmen için).
 */
export async function getPendingRequests() {
  const session = await getAuthSession();
  const db = getSecuredPrisma(TENANT_ID);

  // Sadece ADMIN veya TEACHER görebilir
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "TEACHER" && userRole !== "EXPERT") {
     return { success: false, error: "Bu işlem için yetkiniz yok." };
  }

  const requests = await db.permissionRequest.findMany({
    where: {
      status: "PENDING",
      deletedAt: null
    },
    include: {
      student: true,
      requestedBy: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return { success: true, requests };
}

/**
 * Talebin durumunu günceller (Onay/Red).
 */
export async function updatePermissionStatus(
  requestId: string,
  status: "APPROVED" | "REJECTED"
) {
  const session = await getAuthSession();
  const db = getSecuredPrisma(TENANT_ID);

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "TEACHER" && userRole !== "EXPERT") {
    throw new Error("Bu işlem için yetkiniz yok.");
  }

  const request = await db.permissionRequest.update({
    where: { id: requestId },
    data: {
      status: status,
      approvedById: (session.user as any).id,
    },
  });

  revalidateTenantCache(TENANT_ID, "permissions");
  revalidatePath("/dashboard");

  return { success: true, request };
}

/**
 * Velinin kendi çocuklarını getirir.
 */
export async function getParentStudents() {
  const session = await getAuthSession();
  const db = getSecuredPrisma(TENANT_ID);

  const students = await db.student.findMany({
    where: {
      parentLinks: {
        some: { parentId: (session.user as any).id }
      },
      deletedAt: null
    },
    include: {
        classroom: true
    }
  });

  return { success: true, students };
}
