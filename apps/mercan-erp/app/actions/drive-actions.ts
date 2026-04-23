"use server";

import { prisma } from "@ajans/db";
import { uploadToDrive } from "@ajans/google-api";

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
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "Dosya seçilmedi." };

  try {
    // 1. Veritabanından firmanın Drive Klasör ID'sini bul
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { driveFolderId: true, name: true }
    });

    if (!company || !company.driveFolderId) {
      return { success: false, error: "Seçilen firmanın Drive yapılandırması eksik." };
    }

    // 2. Dosyayı işle
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${new Date().toISOString().split('T')[0]}_${file.name}`;
    
    console.log(`[Server Action] Uploading to ${company.name} Drive Folder: ${company.driveFolderId}`);

    // 3. Google API ile yükle
    const driveResp = await uploadToDrive(buffer, fileName, file.type, company.driveFolderId);

    // 4. Veritabanına Rapor Kaydını At
    // (Şu an auth olmadığı için seed'deki 'uzman@mercan.com' kullanıcısını buluyoruz)
    const expert = await prisma.user.findFirst({ where: { role: "EXPERT" } });

    if (expert) {
        const report = await prisma.report.create({
            data: {
                title: formData.get("title") as string || fileName,
                fileName: fileName,
                fileUrl: driveResp.webViewLink || "",
                driveFileId: driveResp.id || "",
                category: formData.get("category") as string || "Genel",
                status: (formData.get("status") as any) || "BEKLEMEDE",
                folderId: (formData.get("folderId") as string) || null,
                note: (formData.get("note") as string) || null,
                uploadedById: expert.id,
                companyId: companyId
            }
        });

        // Audit Log Kaydı
        await prisma.auditLog.create({
            data: {
                action: "UPLOADED",
                details: `"${report.title}" isimli yeni bir rapor yüklendi.`,
                userId: expert.id,
                companyId: companyId
            }
        });

        // 5. E-posta Bildirimi Gönder
        // (Not: Gerçek senaryoda alıcı listesi firmaya göre DB'den çekilmelidir)
        try {
            const { sendReportNotification } = await import("../../lib/mail");
            await sendReportNotification({
                companyName: company.name,
                category: report.category || "Genel",
                reportTitle: report.title,
                reportDate: new Date().toLocaleDateString("tr-TR"),
                reportLink: report.fileUrl,
                to: ["ahmetnebioglu89@gmail.com"] // Test amaçlı özel adres
            });
        } catch (mailError) {
            console.error("Mail bildirim hatası (işlemi durdurmuyor):", mailError);
        }
    }

    console.log("Upload & DB Record Success:", driveResp.id);
    return { success: true, fileId: driveResp.id, link: driveResp.webViewLink };
  } catch (error: any) {
    console.error("Upload Action Error:", error);
    return { success: false, error: error.message || "Dosya yüklenirken hata oluştu." };
  }
}
