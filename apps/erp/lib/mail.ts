import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY eksik! E-posta gönderimi çalışmayacak.");
    return null;
  }
  return new Resend(key);
};

interface MailParams {
  companyName: string;
  category: string;
  reportTitle: string;
  reportDate: string;
  reportLink: string;
  to: string[];
  subject?: string;
}

export async function sendReportNotification({
  companyName,
  category,
  reportTitle,
  reportDate,
  reportLink,
  to,
  subject,
}: MailParams) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yeni Rapor Bildirimi</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; margin-top: 40px; margin-bottom: 40px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <tr>
                <td align="center" style="padding: 40px 0 30px 0; background-color: #0f172a;">
                    <h1 style="color: #6366f1; margin: 0; font-size: 24px; letter-spacing: -0.025em; font-weight: 800; text-transform: uppercase;">ERP</h1>
                </td>
            </tr>
            <!-- Content -->
            <tr>
                <td style="padding: 40px 40px 20px 40px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-weight: 600;">
                        Sayın ${companyName} Yetkilisi,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569;">
                        Saha uzmanlarımız tarafından firmanıza ait yeni bir rapor sisteme başarıyla yüklenmiştir. Güncel raporun detayları aşağıda bilgilerinize sunulmuştur:
                    </p>
                    <!-- Info Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px; background-color: #f1f5f9; border-radius: 6px;">
                        <tr>
                            <td style="padding: 20px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td width="30%" style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; padding-bottom: 8px;">Kategori</td>
                                        <td style="font-size: 14px; color: #1e293b; padding-bottom: 8px; font-weight: 600;">${category}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; padding-bottom: 8px;">Rapor Adı</td>
                                        <td style="font-size: 14px; color: #1e293b; padding-bottom: 8px;">${reportTitle}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase;">Tarih</td>
                                        <td style="font-size: 14px; color: #1e293b;">${reportDate}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <!-- Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center; margin-bottom: 40px;">
                        <tr>
                            <td>
                                <a href="${reportLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 6px; display: inline-block;">SİSTEMDE GÖRÜNTÜLE</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- Footer -->
            <tr>
                <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 20px;">
                        Bu e-posta otomatik bir bildirimdir, lütfen yanıtlamayınız.<br>
                        ERP | İş Sağlığı ve Güvenliği Yönetim Sistemi
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  const textContent = `
    Sayın ${companyName} Yetkilisi,
    
    Firmanıza ait yeni bir rapor sisteme yüklenmiştir:
    - Kategori: ${category}
    - Rapor Adı: ${reportTitle}
    - Tarih: ${reportDate}
    
    Raporu görüntülemek için şu adrese gidebilirsiniz: ${reportLink}
    
    ERP Bilgilendirme Sistemi
  `;

  try {
    const resend = getResend();
    if (!resend) return { success: false, error: "Resend API anahtarı eksik." };

    const response = await resend.emails.send({
      from: "ERP <onboarding@resend.dev>", // Custom domain eklendiğinde değiştirilebilir
      to,
      subject: subject || `Yeni Rapor Bildirimi: ${companyName}`,
      html: htmlContent,
      text: textContent,
    });

    if (response.error) {
      throw response.error;
    }

    console.log("E-posta başarıyla gönderildi:", response.data?.id);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("E-posta gönderim hatası:", error);
    return { success: false, error };
  }
}
