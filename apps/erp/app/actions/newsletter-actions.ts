"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Tüm aboneleri veya projeye göre aboneleri listeler.
 */
export async function getAllSubscribers(tenantId?: string) {
  try {
    const where = tenantId && tenantId !== "all" ? { tenantId } : {};
    const subscribers = await db.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, subscribers };
  } catch (error) {
    console.error("GET_ALL_SUBSCRIBERS_ERROR:", error);
    return { success: false, error: "Aboneler yüklenemedi." };
  }
}

/**
 * Abone durumunu günceller.
 */
export async function updateSubscriberStatus(id: string, status: string) {
  try {
    await db.newsletterSubscriber.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/cms/newsletter");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Durum güncellenemedi." };
  }
}

/**
 * Aboneyi siler.
 */
export async function deleteSubscriber(id: string) {
  try {
    await db.newsletterSubscriber.delete({
      where: { id },
    });
    revalidatePath("/dashboard/cms/newsletter");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Abone silinemedi." };
  }
}

import { Resend } from "resend";

// Resend Yapılandırması
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "UYARI: RESEND_API_KEY bulunamadı. E-posta gönderimi yapılamayacak.",
    );
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Bülten gönderimi (Gerçek Gönderim).
 */
export async function sendNewsletter(data: {
  tenantId: string;
  subject: string;
  content: string;
}) {
  try {
    const resend = getResend();
    if (!resend) {
      return {
        success: false,
        error: "E-posta servisi yapılandırılamadı (API Key eksik).",
      };
    }

    // 1. Hedef aboneleri çek
    const whereClause: any = { status: "active" };
    if (data.tenantId !== "all") {
      whereClause.tenantId = data.tenantId;
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      where: whereClause,
      select: { email: true },
    });

    if (subscribers.length === 0) {
      return {
        success: false,
        error: "Seçilen kriterlere uygun aktif abone bulunamadı.",
      };
    }

    const emails = subscribers.map((s) => s.email);

    // 2. Resend üzerinden gönder (Batch send - Resend tek seferde 50 alıcıya izin verir,
    // ancak biz güvenli olması için ve multi-tenant yapıda olduğumuzdan döngü veya
    // Resend'in batch API'sini kullanabiliriz. Şimdilik temel batch gönderim yapıyoruz.)

    // Not: Resend 'to' alanında dizi kabul eder.
    const { data: resendData, error } = await resend.emails.send({
      from: "ERP Bülten <newsletter@resend.dev>", // Custom domain bağlandığında güncellenmeli
      to: emails,
      subject: data.subject,
      html: `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 32px; background-color: #ffffff;">
          <div style="margin-bottom: 40px; text-align: center;">
             <h1 style="color: #0f172a; font-size: 28px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0;">BÜLTEN <span style="color: #2563eb;">GÜNCELLEMESİ</span></h1>
             <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">${data.tenantId.toUpperCase()} PROJESİNDEN SİZE BİR MESAJ VAR</p>
          </div>
          
          <div style="color: #334155; font-size: 16px; line-height: 1.8;">
            ${data.content}
          </div>

          <hr style="margin: 40px 0; border: 0; border-top: 1px solid #f1f5f9;" />
          
          <div style="text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; font-style: italic; margin-bottom: 24px;">
              Bu e-postayı ERP bültenine abone olduğunuz için alıyorsunuz. 
              Abonelikten ayrılmak isterseniz web sitemizi ziyaret edebilirsiniz.
            </p>
            <div style="display: inline-block; padding: 8px 16px; background-color: #f8fafc; border-radius: 8px; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase;">
              © 2026 AJANS MONOREPO ECOSYSTEM
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND_ERROR:", error);
      return { success: false, error: `Gönderim başarısız: ${error.message}` };
    }

    return {
      success: true,
      message: `Bülten ${emails.length} aboneye başarıyla gönderildi.`,
    };
  } catch (error) {
    console.error("NEWSLETTER_SEND_ERROR:", error);
    return {
      success: false,
      error: "Gönderim sırasında beklenmedik bir hata oluştu.",
    };
  }
}
