"use server";

import { protectedAction } from "@ajans/core/server";
import { WorkspaceAdminService } from "@ajans/google-api";
import { revalidatePath } from "next/cache";

/**
 * RBAC Kontrolü: Sadece ADMIN ve HR_MANAGER rollerine izin verilir.
 */
const DEFAULT_TENANT_ID = "mercan";

const checkPermission = (role: string) => {
  if (role !== "ADMIN" && role !== "HR_MANAGER") {
    throw new Error(
      "YETKİSİZ_ERİŞİM: Bu işlem için sadece Admin veya İK Müdürü yetkisine sahip olmalısınız.",
    );
  }
};

/**
 * Domain bilgisini al (TenantId'ye bağlı varsayılan domain)
 * Gerçek senaryoda bu bilgi veritabanından veya tenant ayarlarından gelmelidir.
 */
const getDomain = (tenantId: string) => {
  return tenantId === DEFAULT_TENANT_ID ? "erp.com.tr" : `${tenantId}.com`;
};

/**
 * Google Workspace kullanıcılarını listeler.
 */
export async function listWorkspaceUsersAction() {
  return protectedAction(async ({ user, tenantId }) => {
    checkPermission(user.role);
    const domain = getDomain(tenantId);
    const service = new WorkspaceAdminService();
    return await service.listUsers(domain);
  });
}

/**
 * Yeni bir Google Workspace hesabı oluşturur.
 */
export async function createWorkspaceUserAction(data: {
  givenName: string;
  familyName: string;
  emailPrefix: string;
}) {
  return protectedAction(async ({ db, user, tenantId }) => {
    checkPermission(user.role);
    const domain = getDomain(tenantId);
    const primaryEmail = `${data.emailPrefix}@${domain}`;

    const service = new WorkspaceAdminService();
    const newUser = await service.createUser({
      givenName: data.givenName,
      familyName: data.familyName,
      primaryEmail: primaryEmail,
    });

    // Audit Log kaydı
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_USER_CREATE",
        details: JSON.stringify({
          user: primaryEmail,
          action: "CREATE_ACCOUNT",
          domain: domain,
          performedBy: user.email,
        }),
        tenantId: tenantId || DEFAULT_TENANT_ID,
      },
    });

    revalidatePath("/dashboard/mail");
    return newUser;
  });
}

/**
 * Kullanıcı hesabını askıya alır veya aktif eder.
 */
export async function toggleUserStatusAction(email: string, suspend: boolean) {
  return protectedAction(async ({ db, user, tenantId }) => {
    checkPermission(user.role);
    const service = new WorkspaceAdminService();

    let result;
    const actionType = suspend ? "SUSPEND" : "REACTIVATE";

    if (suspend) {
      result = await service.suspendUser(email);
    } else {
      result = await service.reactivateUser(email);
    }

    // Audit Log kaydı
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_USER_UPDATE",
        details: JSON.stringify({
          user: email,
          action: actionType,
          performedBy: user.email,
        }),
        tenantId: tenantId || DEFAULT_TENANT_ID,
      },
    });

    revalidatePath("/dashboard/mail");
    return result;
  });
}

/**
 * Kullanıcı şifresini sıfırlar.
 */
export async function resetUserPasswordAction(
  email: string,
  newPassword: string,
) {
  return protectedAction(async ({ db, user, tenantId }) => {
    checkPermission(user.role);
    const service = new WorkspaceAdminService();
    const result = await service.resetPassword(email, newPassword);

    // Audit Log kaydı
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_USER_UPDATE",
        details: JSON.stringify({
          user: email,
          action: "PASSWORD_RESET",
          performedBy: user.email,
        }),
        tenantId: tenantId || DEFAULT_TENANT_ID,
      },
    });

    revalidatePath("/dashboard/mail");
    return result;
  });
}
