"use server";

import { prisma } from "@ajans/db";

/**
 * Saha uzmanının yetkisi olduğu firmaları getirir.
 * Not: Şu an auth tam entegre olmadığı için demo uzman emailini kullanıyoruz.
 */
export async function getExpertCompanies() {
  const expertEmail = "uzman@mercan.com"; // Mock email for now
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: expertEmail },
      include: {
        companyAccess: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) return { success: false, error: "Uzman bulunamadı." };

    const companies = user.companyAccess.map(access => ({
      id: access.company.id,
      name: access.company.name,
      driveFolderId: access.company.driveFolderId
    }));

    return { success: true, companies };
  } catch (error) {
    console.error("Firma getirme hatası:", error);
    return { success: false, error: "Firmalar yüklenirken bir hata oluştu." };
  }
}
