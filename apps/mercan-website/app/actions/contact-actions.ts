"use server"; // Updated schema support

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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

    // E-posta gönderimi (Opsiyonel işlem, hata alsa da süreci bozmasın)
    try {
      const resend = getResend();
      if (resend) {
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/verify?token=${token}&type=contact`;

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
        console.log(`BİLGİ: ${data.email} adresine doğrulama maili başarıyla gönderildi.`);
      }
    } catch (mailError) {
      console.error("MAIL_SEND_ERROR:", mailError);
      // Mail hatası mesajın kaydedilmesini engellememeli
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
