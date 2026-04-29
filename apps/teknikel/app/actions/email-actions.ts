'use server';

import { sendOutreachEmail } from '@/lib/email';

export async function sendTestEmail(email: string) {
  try {
    if (!email) {
      return { success: false, error: 'E-posta adresi boş olamaz.' };
    }

    const result = await sendOutreachEmail({
      id: 'test-id',
      email: email,
      name: 'Test Kullanıcısı'
    });

    return result;
  } catch (error: any) {
    console.error('Send Test Email Error:', error);
    return { success: false, error: error.message || 'Bir hata oluştu.' };
  }
}
