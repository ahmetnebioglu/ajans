import { Resend } from 'resend';
import { logApiUsage } from '@ajans/db';
import { getCachedSettings } from '@ajans/core';
import { render } from '@react-email/render';
import { ServiceNotificationEmail } from '../emails/ServiceNotificationEmail';
import React from 'react';

export async function sendOutreachEmail(lead: { id: string, email: string, name: string | null }) {
  const settings = await getCachedSettings();
  const resend = new Resend(settings?.resendApiKey || process.env.RESEND_API_KEY);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006';
  const catalogUrl = `${baseUrl}/api/track/link?id=${lead.id}&url=https://teknikelkombi.com/katalog.pdf`;

  try {
    // React Email şablonunu HTML'e dönüştür
    const emailHtml = await render(
      React.createElement(ServiceNotificationEmail, {
        customerName: lead.name || 'Değerli Müşterimiz',
        messageTitle: 'Servis İşlemleriniz Tamamlandı',
        deviceModel: 'Kombi/Isıtma Sistemi',
        actionUrl: catalogUrl
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'Teknikel <onboarding@resend.dev>', // Test için onboarding adresi kullanılmalı, domain doğrulanınca iletisim@ajans.com yapılabilir
      to: [lead.email],
      subject: 'Teknikel Kombi - Tanışma ve Hizmet Kataloğu',
      html: emailHtml,
    });

    if (error) {
      console.error('Email Send Error:', error);
      return { success: false, error };
    }

    // API kullanımını logla (Tahmini maliyet: 0.001 $)
    await logApiUsage("RESEND", "SEND_EMAIL", 0.001);

    return { success: true, data };
  } catch (err: any) {
    console.error('Email Render/Send Error:', err);
    return { success: false, error: err.message };
  }
}
