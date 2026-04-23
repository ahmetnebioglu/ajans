import { Resend } from 'resend';

import { VERIFICATION_TEMPLATE, WELCOME_TEMPLATE } from './mail-templates';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
};

export async function sendNewsletterVerification(email: string, token: string) {
  const resend = getResend();
  if (!resend) return { success: false };

  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-newsletter?token=${token}`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${email}`;

  const html = VERIFICATION_TEMPLATE
    .replace('{{verify_url}}', verificationUrl)
    .replace('{{unsubscribe_url}}', unsubscribeUrl);

  await resend.emails.send({
    from: 'Mercan OSGB <onboarding@resend.dev>',
    to: [email],
    subject: 'Aboneliğinizi Onaylayın | Mercan OSGB',
    html
  });
}

export async function sendWelcomeEmail(email: string) {
  const resend = getResend();
  if (!resend) return { success: false };

  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${email}`;
  const siteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}`;

  const html = WELCOME_TEMPLATE
    .replace('{{site_url}}', siteUrl)
    .replace('{{unsubscribe_url}}', unsubscribeUrl);

  await resend.emails.send({
    from: 'Mercan OSGB <onboarding@resend.dev>',
    to: [email],
    subject: 'Aramıza Hoş Geldiniz! İSG Dökümanlarınız Hazır',
    html
  });
}

export async function sendContactNotification(data: { name: string, email: string, message: string }) {
  const resend = getResend();
  if (!resend) return { success: false };

  await resend.emails.send({
    from: 'Mercan Website <onboarding@resend.dev>',
    to: ['admin@mercanerp.com'], // ERP adminlerine
    subject: `Yeni İletişim Mesajı: ${data.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>İsim:</strong> ${data.name}</p>
        <p><strong>E-posta:</strong> ${data.email}</p>
        <p><strong>Mesaj:</strong></p>
        <div style="padding: 15px; background: #f8fafc; border-radius: 8px;">${data.message}</div>
      </div>
    `
  });
}
