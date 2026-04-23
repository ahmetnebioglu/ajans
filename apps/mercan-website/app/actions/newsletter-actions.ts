"use server";

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";

/**
 * Yeni bir bülten abonesi kaydeder.
 * @param email Abone e-postası
 * @param projectSlug Kaynak proje (Örn: "mercan")
 */
export async function subscribeToNewsletter(email: string, projectSlug: string) {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Geçerli bir e-posta adresi girin." };
    }

    // Mevcut aboneyi kontrol et
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "active") {
        return { success: false, error: "Bu e-posta zaten bültenimize kayıtlı." };
      } else {
        // Unsubscribed ise tekrar active yap
        await db.newsletterSubscriber.update({
          where: { email },
          data: { status: "active", projectSlug },
        });
        return { success: true, message: "Aboneliğiniz tekrar aktif edildi!" };
      }
    }

    // Yeni kayıt oluştur
    await db.newsletterSubscriber.create({
      data: {
        email,
        projectSlug,
        status: "active",
      },
    });

    revalidatePath("/");
    return { success: true, message: "Bültene başarıyla kayıt oldunuz!" };
  } catch (error) {
    console.error("NEWSLETTER_SUBSCRIBE_ERROR:", error);
    return { success: false, error: "Bir hata oluştu, lütfen daha sonra tekrar deneyin." };
  }
}

/**
 * Projeye göre aboneleri listeler.
 */
export async function getSubscribersByProject(projectSlug?: string) {
  try {
    const where = projectSlug ? { projectSlug } : {};
    const subscribers = await db.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, subscribers };
  } catch (error) {
    console.error("GET_SUBSCRIBERS_ERROR:", error);
    return { success: false, error: "Aboneler yüklenemedi." };
  }
}
