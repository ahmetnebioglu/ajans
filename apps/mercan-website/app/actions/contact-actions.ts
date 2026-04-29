"use server"; // Updated schema support

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { submitContactForm as coreSubmitContactForm } from "@ajans/core";

// Resend'i sadece API key varsa ve ihtiyaç duyulduğunda başlatmak daha güvenlidir
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("UYARI: RESEND_API_KEY bulunamadı. E-posta gönderimi yapılamayacak.");
    return null;
  }
  return new Resend(apiKey);
};

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Önce mesajı veritabanına kaydet (Hayati işlem)
    const message = await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        verificationToken: token,
        isVerified: false,
      },
    });

    // 1. Kullanıcıya E-posta Doğrulama Maili Gönder (Mevcut mantık)
    try {
      const resend = getResend();
      if (resend) {
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/verify?token=${token}&type=contact`;

        // KULLANICIYA DOĞRULAMA MAİLİ
        await resend.emails.send({
          from: 'Mercan OSGB <onboarding@resend.dev>',
          to: [data.email],
          subject: 'İletişim Talebinizi Doğrulayın',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-transform: uppercase; font-style: italic; margin-bottom: 24px;">Merhaba ${data.name},</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                İletişim formumuz aracılığıyla bize bir mesaj ilettiniz. Talebinizi işleme alabilmemiz için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 800; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                Talebi Doğrula
              </a>
              <hr style="margin: 40px 0; border: 0; border-top: 1px solid #e2e8f0;" />
              <p style="color: #94a3b8; font-size: 12px; font-style: italic;">
                Eğer bu talebi siz oluşturmadıysanız, bu e-postayı dikkate almayabilirsiniz.
              </p>
            </div>
          `
        });

        // 2. YÖNETİCİYE BİLDİRİM MAİLİ GÖNDER (YENİ)
        const adminEmail = process.env.ADMIN_EMAIL || 'ahmetnebioglu@gmail.com';
        await resend.emails.send({
          from: 'Mercan OSGB Sistem <system@resend.dev>',
          to: [adminEmail],
          subject: `Yeni İletişim Formu Mesajı: ${data.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc; border-radius: 32px; border: 1px solid #e2e8f0;">
               <div style="background-color: #0f172a; padding: 24px; border-radius: 20px; margin-bottom: 32px; text-align: center;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: 1px;">YENİ MESAJ BİLDİRİMİ</h2>
               </div>
               
               <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; width: 30%;">Gönderen</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">${data.name}</td>
                  </tr>
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">E-Posta</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-size: 14px; font-weight: 700;">${data.email}</td>
                  </tr>
                  <tr>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">Konu</td>
                     <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">${data.subject}</td>
                  </tr>
               </table>

               <div style="margin-top: 32px;">
                  <h4 style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">Mesaj İçeriği:</h4>
                  <div style="background-color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; color: #334155; font-size: 15px; line-height: 1.6; font-style: italic;">
                     ${data.message.replace(/\n/g, '<br/>')}
                  </div>
               </div>

               <div style="margin-top: 40px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/dashboard/cms/talepler" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                     Panelden Görüntüle
                  </a>
               </div>
            </div>
          `
        });
        
        console.log(`BİLGİ: İletişim mesajı yöneticiye bildirildi.`);
      }
    } catch (mailError) {
      console.error("ADMIN_MAIL_NOTIFICATION_ERROR:", mailError);
      
      // HATA KAYDI: Mail gönderilemediğini yönetici paneline bildir
      try {
        await db.notification.create({
          data: {
            userId: null, // Sistem bildirimi
            type: "ERROR",
            message: `İletişim Formu Hatası: ${data.name} tarafından gönderilen mesajın bildirim maili iletilemedi. Lütfen panelden kontrol edin.`,
          }
        });
      } catch (dbError) {
        console.error("NOTIFICATION_CREATE_ERROR:", dbError);
      }
    }

    revalidatePath("/dashboard/cms/talepler");
    return { success: true, data: message };
  } catch (error) {
    console.error("CONTACT_MESSAGE_CREATE_ERROR:", error);
    return { success: false, error: "Mesaj gönderilirken bir hata oluştu." };
  }
}

export async function verifyRequest(token: string, type: "contact" | "reference") {
  try {
    if (type === "contact") {
      await db.contactMessage.update({
        where: { verificationToken: token },
        data: { isVerified: true },
      });
    } else {
      await db.referenceRequest.update({
        where: { verificationToken: token },
        data: { isVerified: true },
      });
    }
    
    revalidatePath("/dashboard/cms/talepler");
    return { success: true };
  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return { success: false, error: "Doğrulama yapılamadı." };
  }
}

export async function submitContactAction(data: {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return await coreSubmitContactForm(data, 'MERCAN_WEBSITE', 'mercan');
}

