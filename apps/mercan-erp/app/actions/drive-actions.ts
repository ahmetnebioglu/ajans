"use server";

import { prisma } from "@/lib/db";
import { uploadToDrive } from "@ajans/google-api";
import { protectedAction } from "@ajans/core/server";
import { revalidatePath } from "next/cache";

export async function uploadReportAction(formData: FormData, companyId: string) {
  return protectedAction(async ({ db, user, tenantId }) => {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Dosya seçilmedi.");

    // 1. Yetki Kontrolü (Uzmanlar için)
    if (user.role === "EXPERT") {
      const hasAccess = await db.companyAccess.findUnique({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: companyId
          }
        }
      });
      if (!hasAccess) throw new Error("Bu firmaya rapor yükleme yetkiniz bulunmamaktadır.");
    }

    // 2. Veritabanından firmanın Drive Klasör ID'sini bul
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { driveFolderId: true, name: true }
    });

    if (!company || !company.driveFolderId) {
      console.warn(">>> [DriveAction] Drive yapılandırması eksik, mock yükleme yapılıyor...");
    }

    const driveFolderId = company?.driveFolderId || "mock_folder_id";

    // 2. Dosyayı işle
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${new Date().toISOString().split('T')[0]}_${file.name}`;
    
    // 3. Google API ile yükle
    let driveResp: { id?: string | null; webViewLink?: string | null } = { 
      id: "mock_file_id", 
      webViewLink: "https://drive.google.com/mock" 
    };
    if (driveFolderId !== "mock_folder_id") {
       driveResp = await uploadToDrive(buffer, fileName, file.type, driveFolderId);
    }

    // 4. Veritabanına Rapor Kaydını At
    try {
        console.log(">>> [DriveAction] Creating report with data:", {
            title: (formData.get("title") as string) || fileName,
            companyId,
            tenantId,
            userId: user.id
        });

        const report = await db.report.create({
            data: {
                title: (formData.get("title") as string) || fileName,
                fileName: fileName,
                fileUrl: driveResp.webViewLink || "",
                driveFileId: driveResp.id || "",
                category: (formData.get("category") as string) || "Genel",
                status: (formData.get("status") as string) || "BEKLEMEDE",
                folderId: formData.get("folderId") ? (formData.get("folderId") as string) : null,
                note: (formData.get("note") as string) || null,
                uploadedById: user.id,
                companyId: companyId,
                tenantId: tenantId || "mercan"
            }
        });
        
        console.log(">>> [DriveAction] Report created successfully:", report.id);

        // Audit Log Kaydı
        await db.auditLog.create({
            data: {
                action: "UPLOADED",
                details: `"${report.title}" isimli yeni bir rapor yüklendi.`,
                userId: (user as any).id || null,
                companyId: companyId || null,
                tenantId: tenantId || "mercan"
            }
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
                to: ["ahmetnebioglu89@gmail.com"] 
            });
        } catch (mailError) {
            console.error("Mail bildirim hatası (işlemi durdurmuyor):", mailError);
        }

        revalidatePath(`/dashboard/companies/${companyId}`);
        return { success: true, fileId: driveResp.id, link: driveResp.webViewLink };
    } catch (dbError: any) {
        console.error(">>> [DriveAction] DB Error during report creation:", dbError);
        throw new Error(`Veritabanı kayıt hatası: ${dbError.message || "Bilinmeyen Prisma hatası"}`);
    }
  });
}
