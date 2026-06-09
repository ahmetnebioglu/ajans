"use server";

import { unsecured_prisma as prisma } from "@ajans/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function submitApplication(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const appliedForId = formData.get("appliedForId") as string;
    const cvFile = formData.get("cvFile") as File;

    // 1. Temel Validasyon
    if (!firstName || !lastName || !email || !appliedForId) {
      return { success: false, error: "Lütfen zorunlu alanları doldurun." };
    }

    // 2. Dosya Güvenlik Kontrolleri
    let cvUrl = "";
    if (cvFile && cvFile.size > 0) {
      // Boyut Kontrolü (Max 5MB)
      if (cvFile.size > 5 * 1024 * 1024) {
        return { success: false, error: "CV dosyası 5MB'dan büyük olamaz." };
      }

      // Tip Kontrolü (Sadece PDF)
      if (cvFile.type !== "application/pdf") {
        return { success: false, error: "Sadece PDF formatında CV yükleyebilirsiniz." };
      }

      // Güvenli Dosya Kaydı (UUID ile isimlendirme - KVKK Uyumu)
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      const fileName = `${uuidv4()}.pdf`;
      const uploadDir = path.join(process.cwd(), "..", "erp", "public", "uploads", "cvs");
      
      // Dizin kontrolü (Yoksa oluştur)
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      // Veritabanına kaydedilecek URL (ERP üzerinden erişilebilir olması için)
      cvUrl = `/uploads/cvs/${fileName}`;
    }

    // 3. Aday Kaydı Oluştur (SQL Transaction kullanımı)
    const result = await prisma.$transaction(async (tx) => {
      const candidate = await tx.candidate.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          cvUrl,
          status: "NEW",
            communicationOptIn: true,
          appliedForId,
          tenantId: "mercan",
        },
      });

      // Sistem günlüğü oluştur
      await tx.auditLog.create({
        data: {
          action: "WEBSITE_APPLICATION_RECEIVED",
          details: `Kariyer portalı üzerinden yeni PDF başvurusu alındı: ${firstName} ${lastName} - Dosya: ${cvUrl}`,
          tenantId: "mercan",
        },
      });

      return candidate;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error(">>> [KariyerActions] Error:", error);
    return { success: false, error: "Sistem hatası oluştu, lütfen daha sonra tekrar deneyiniz." };
  }
}

export async function getActiveJobPostings() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: {
        status: "ACTIVE",
        tenantId: "mercan",
      },
      orderBy: {
        createdAt: "desc",
      }
    });
    
    if (jobs.length === 0) {
      const generalJob = await prisma.jobPosting.upsert({
        where: { id: "general-application" },
        update: { status: "ACTIVE" },
        create: {
          id: "general-application",
          title: "Genel Başvuru",
          description: "Mercan bünyesinde ileride oluşabilecek pozisyonlar için genel başvuru.",
          status: "ACTIVE",
          tenantId: "mercan",
        }
      });
      return [generalJob];
    }
    
    return jobs;
  } catch (error) {
    console.error(">>> [KariyerActions] getActiveJobPostings Error:", error);
    return [];
  }
}
