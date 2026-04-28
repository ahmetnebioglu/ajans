import { Resend } from 'resend';
import { logApiUsage } from '@ajans/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOutreachEmail(lead: { id: string, email: string, name: string | null }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006';
  const pixelUrl = `${baseUrl}/api/track/pixel/${lead.id}`;
  const catalogUrl = `${baseUrl}/api/track/link?id=${lead.id}&url=https://teknikelkombi.com/katalog.pdf`;

  const { data, error } = await resend.emails.send({
    from: 'Teknikel Kombi <iletisim@ajans.com>',
    to: [lead.email],
    subject: 'Teknikel Kombi - Tanışma ve Hizmet Kataloğu',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2>Merhaba ${lead.name || 'İşletme Yetkilisi'},</h2>
        <p>Sizinle Google Places üzerinden tanıştık. Teknikel Kombi olarak profesyonel bakım ve onarım hizmetleri sunuyoruz.</p>
        <p>Hizmetlerimizi daha yakından tanımak için aşağıdaki bağlantıdan kataloğumuzu inceleyebilirsiniz:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${catalogUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Hizmet Kataloğumuzu Görüntüle
          </a>
        </p>
        <p>En kısa sürede görüşmek dileğiyle.</p>
        <p><strong>Teknikel Kombi Ekibi</strong></p>
        
        <img src="${pixelUrl}" width="1" height="1" style="display:none;" />
      </div>
    `,
  });

  if (error) {
    console.error('Email Send Error:', error);
    return { success: false, error };
  }

  // API kullanımını logla (Tahmini maliyet: 0.001 $)
  logApiUsage("RESEND", "SEND_EMAIL", 0.001);

  return { success: true, data };
}
