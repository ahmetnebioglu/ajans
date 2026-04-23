"use server";

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("UYARI: RESEND_API_KEY bulunamadı. E-posta gönderimi yapılamayacak.");
    return null;
  }
  return new Resend(apiKey);
};

export async function createReferenceRequest(data: {
  fullName: string;
  companyName: string;
  email: string;
  sector: string;
}) {
  try {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Önce talebi veritabanına kaydet
    const request = await db.referenceRequest.create({
      data: {
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        sector: data.sector,
        verificationToken: token,
        isVerified: false,
      },
    });

    // E-posta gönderimi (Hata alsa da akışı bozmaz)
    try {
      const resend = getResend();
      if (resend) {
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/verify?token=${token}&type=reference`;

        await resend.emails.send({
          from: 'Mercan OSGB <onboarding@resend.dev>',
          to: [data.email],
          subject: 'Referans Talebinizi Doğrulayın',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-transform: uppercase; font-style: italic; margin-bottom: 24px;">Merhaba ${data.fullName},</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                <b>${data.companyName}</b> firması adına referans listemizi talep ettiniz. Talebinizi işleme alabilmemiz için lütfen aşağıdaki butona tıklayarak doğrulama işlemini tamamlayın.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 800; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                Talebi Onayla
              </a>
              <hr style="margin: 40px 0; border: 0; border-top: 1px solid #e2e8f0;" />
              <p style="color: #94a3b8; font-size: 12px; font-style: italic;">
                Mercan OSGB Kurumsal Çözüm Ortağınız.
              </p>
            </div>
          `
        });
        console.log(`BİLGİ: ${data.email} adresine referans doğrulama maili gönderildi.`);
      }
    } catch (mailError) {
      console.error("REFERENCE_MAIL_ERROR:", mailError);
    }

    revalidatePath("/dashboard/cms/talepler");
    return { success: true, data: request };
  } catch (error) {
    console.error("REFERENCE_REQUEST_CREATE_ERROR:", error);
    return { success: false, error: "Talep oluşturulurken bir hata oluştu." };
  }
}
