"use server";

import { prisma } from "@/lib/db";
import { uploadToDrive } from "@ajans/google-api";
import { protectedAction } from "@ajans/core/server";

export async function uploadFieldReport(formData: FormData) {
  const file = formData.get("file") as File;
  const firmId = formData.get("firmId") as string;
  const userId = formData.get("userId") as string;

  console.log(`Uploading report for firm: ${firmId} by user: ${userId}`);
  
  // Real implementation will call google-api package
  const fakeDriveId = "drive_id_" + Math.random().toString(36).substring(7);

  const document = await (prisma as any).document.create({
    data: {
      title: file.name,
      driveFileId: fakeDriveId,
      uploadedById: userId,
      firmId: firmId,
    },
  });

  return { success: true, document };
}

export async function uploadReportAction(formData: FormData, companyId: string) {
  return protectedAction(async ({ db, user, tenantId }) => {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Dosya seçilmedi.");

    // 1. Veritabanından firmanın Drive Klasör ID'sini bul
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
    const report = await db.report.create({
        data: {
            title: formData.get("title") as string || fileName,
            fileName: fileName,
            fileUrl: driveResp.webViewLink || "",
            driveFileId: driveResp.id || "",
            category: formData.get("category") as string || "Genel",
            status: (formData.get("status") as any) || "BEKLEMEDE",
            folderId: (formData.get("folderId") as string) || null,
            note: (formData.get("note") as string) || null,
            uploadedById: user.id,
            companyId: companyId
        }
    });

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
            companyName: company.name,
            category: report.category || "Genel",
            reportTitle: report.title,
            reportDate: new Date().toLocaleDateString("tr-TR"),
            reportLink: report.fileUrl,
            to: ["ahmetnebioglu89@gmail.com"] 
        });
    } catch (mailError) {
        console.error("Mail bildirim hatası (işlemi durdurmuyor):", mailError);
    }

    return { success: true, fileId: driveResp.id, link: driveResp.webViewLink };
  });
}
