"use server";

import { prisma } from "@/lib/db";
import { DEFAULT_TENANT_ID } from "@/lib/auth";
import { uploadFile } from "@ajans/core";
import { protectedAction } from "@ajans/core/server";
import { revalidatePath } from "next/cache";

export async function uploadReportAction(
  formData: FormData,
  workspaceId: string,
) {
  return protectedAction(async ({ db, user, tenantId }) => {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Dosya seçilmedi.");

    // 1. Yetki Kontrolü (Uzmanlar için)
    if (user.role === "EXPERT") {
      const hasAccess = await db.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: workspaceId,
          },
        },
      });
      if (!hasAccess)
        throw new Error("Bu firmaya rapor yükleme yetkiniz bulunmamaktadır.");
    }

    // 2. Veritabanından firma adını bul
    const company = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // 3. Dosyayı işle
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${new Date().toISOString().split("T")[0]}_${file.name}`;

    // 4. S3/R2 ile yükle
    const uploadTenantId = tenantId || DEFAULT_TENANT_ID;
    const s3Resp = await uploadFile(
      buffer,
      fileName,
      file.type,
      uploadTenantId,
      `reports/${workspaceId}`
    );

    // 5. Veritabanına Rapor Kaydını At
    try {
      console.log(">>> [DriveAction] Creating report with data:", {
        title: (formData.get("title") as string) || fileName,
        workspaceId,
        tenantId: uploadTenantId,
        userId: user.id,
      });

      const report = await db.report.create({
        data: {
          title: (formData.get("title") as string) || fileName,
          fileName: fileName,
          fileUrl: s3Resp.url,
          s3Key: s3Resp.key,
          category: (formData.get("category") as string) || "Genel",
          status: (formData.get("status") as string) || "BEKLEMEDE",
          folderId: formData.get("folderId")
            ? (formData.get("folderId") as string)
            : null,
          note: (formData.get("note") as string) || null,
          uploadedById: user.id,
          workspaceId: workspaceId,
          tenantId: uploadTenantId,
        },
      });

      console.log(">>> [DriveAction] Report created successfully:", report.id);

      // Audit Log Kaydı
      await db.auditLog.create({
        data: {
          action: "UPLOADED",
          details: `"${report.title}" isimli yeni bir rapor yüklendi.`,
          userId: (user as any).id || null,
          workspaceId: workspaceId || null,
          tenantId: uploadTenantId,
        },
      });

      // 5. E-posta Bildirimi Gönder
      try {
        const { sendReportNotification } = await import("../../lib/mail");
        await sendReportNotification({
          companyName: company?.name || "Bilinmeyen Firma",
          category: report.category || "Genel",
          reportTitle: report.title,
          reportDate: new Date().toLocaleDateString("tr-TR"),
          reportLink: report.fileUrl || "",
          to: ["ahmetnebioglu89@gmail.com"],
        });
      } catch (mailError) {
        console.error("Mail bildirim hatası (işlemi durdurmuyor):", mailError);
      }

      revalidatePath(`/dashboard/companies/${workspaceId}`);
      return {
        success: true,
        fileId: s3Resp.key,
        link: s3Resp.url,
      };
    } catch (dbError: any) {
      console.error(
        ">>> [DriveAction] DB Error during report creation:",
        dbError,
      );
      throw new Error(
        `Veritabanı kayıt hatası: ${dbError.message || "Bilinmeyen Prisma hatası"}`,
      );
    }
  });
}
