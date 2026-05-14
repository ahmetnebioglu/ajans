'use server';

import { sendSms } from '@ajans/core/server';

export async function sendTestSms(phone: string, message: string) {
  try {
    if (!phone || !message) {
      return { success: false, error: 'Telefon numarası ve mesaj boş olamaz.' };
    }

    const success = await sendSms(phone, message);

    if (success) {
      return { success: true };
    } else {
      return { success: false, error: 'SMS gönderimi başarısız oldu. Logları kontrol edin.' };
    }
  } catch (error: any) {
    console.error('Send Test SMS Error:', error);
    return { success: false, error: error.message || 'Bir hata oluştu.' };
  }
}
