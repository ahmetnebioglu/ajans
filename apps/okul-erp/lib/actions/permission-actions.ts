"use server";

import { protectedAction } from "@ajans/core/server";
import { revalidatePath } from "next/cache";

export async function createPermissionRequest(data: {
  studentId: string;
  type: string;
  reason: string;
  date: Date;
}) {
  return protectedAction(async ({ db, user, tenantId }) => {
    const request = await db.permissionRequest.create({
      data: {
        studentId: data.studentId,
        requestedById: user.id,
        type: data.type,
        reason: data.reason,
        date: data.date,
        status: "PENDING",
        tenantId: tenantId,
      },
    });
   
    revalidatePath("/dashboard");
    return request;
  });
}

export async function getPendingRequests() {
  return protectedAction(async ({ db, user, tenantId }) => {
    // Sadece ADMIN veya TEACHER görebilir (Eski rolde TEACHER vardı, yeni şemada USER/ADMIN/EXPERT var)
    if (user.role !== "ADMIN" && user.role !== "EXPERT" && user.role !== "USER") {
       throw new Error("Bu işlem için yetkiniz yok.");
    }
   
    return await db.permissionRequest.findMany({
      where: {
        status: "PENDING",
        deletedAt: null,
        tenantId: tenantId
      },
      include: {
        student: true,
        requestedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  });
}

export async function updatePermissionStatus(
  requestId: string,
  status: "APPROVED" | "REJECTED"
) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN" && user.role !== "EXPERT") {
      throw new Error("Bu işlem için yetkiniz yok.");
    }
   
    return await db.permissionRequest.update({
      where: { id: requestId },
      data: {
        status: status,
        approvedById: user.id,
      },
    });
  });
}

export async function getParentStudents() {
  return protectedAction(async ({ db, user }) => {
    return await db.student.findMany({
      where: {
        parentLinks: {
          some: { parentId: user.id }
        },
        deletedAt: null
      },
      include: {
          classroom: true
      }
    });
  });
}
