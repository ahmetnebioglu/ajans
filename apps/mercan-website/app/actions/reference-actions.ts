"use server";

import { prisma as db } from "@/lib/db";
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

        // 2. YÖNETİCİYE BİLDİRİM MAİLİ GÖNDER
        const adminEmail = process.env.ADMIN_EMAIL || 'ahmetnebioglu@gmail.com';
        await resend.emails.send({
          from: 'Mercan OSGB Sistem <system@resend.dev>',
          to: [adminEmail],
          subject: `Yeni Referans Talebi: ${data.companyName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f0f9ff; border-radius: 32px; border: 1px solid #bae6fd;">
               <div style="background-color: #0c4a6e; padding: 24px; border-radius: 20px; margin-bottom: 32px; text-align: center;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: 1px;">YENİ REFERANS TALEBİ</h2>
               </div>
               
               <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; text-transform: uppercase; width: 35%;">Talep Eden</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0f172a; font-size: 14px; font-weight: 700;">${data.fullName}</td>
                  </tr>
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; text-transform: uppercase;">Firma</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0f172a; font-size: 14px; font-weight: 700;">${data.companyName}</td>
                  </tr>
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; text-transform: uppercase;">E-Posta</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0369a1; font-size: 14px; font-weight: 700;">${data.email}</td>
                  </tr>
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; text-transform: uppercase;">Sektör</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e0f2fe; color: #0f172a; font-size: 14px; font-weight: 700;">${data.sector}</td>
                  </tr>
               </table>

               <div style="margin-top: 40px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/dashboard/cms/talepler" style="display: inline-block; background-color: #0c4a6e; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                     Panelden Detayları Gör
                  </a>
               </div>
            </div>
          `
        });
      }
    } catch (mailError) {
      console.error("REFERENCE_ADMIN_MAIL_ERROR:", mailError);
      // HATA KAYDI: Panel bildirimi oluştur
      try {
        await db.notification.create({
          data: {
            userId: null,
            type: "WARNING",
            message: `Referans Talebi Bildirimi Hatası: ${data.companyName} firmasının talebi için yönetici bildirimi iletilemedi.`,
          }
        });
      } catch (dbError) {
        console.error("NOTIFICATION_DB_ERROR:", dbError);
      }
    }

    revalidatePath("/dashboard/cms/talepler");
    return { success: true, data: request };
  } catch (error) {
    console.error("REFERENCE_REQUEST_CREATE_ERROR:", error);
    return { success: false, error: "Talep oluşturulurken bir hata oluştu." };
  }
}

