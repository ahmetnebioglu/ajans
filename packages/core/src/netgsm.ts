import { logApiUsage } from '@ajans/db';
import { getCachedSettings } from './settings';

/**
 * NetGSM SMS gönderme servisi
 * @param phone Telefon numarası (905xxxxxxxxx formatında önerilir)
 * @param message Mesaj metni
 * @returns Başarı durumunda true, hata durumunda false döner
 */
export async function sendSms(phone: string, message: string): Promise<boolean> {
  const settings = await getCachedSettings();
  const usercode = settings?.netgsmUsercode || process.env.NETGSM_USERCODE;
  const password = settings?.netgsmPassword || process.env.NETGSM_PASSWORD;
  const sender = process.env.NETGSM_SENDER || process.env.NETGSM_HEADER || 'TEKNIKEL';
  const baseUrl = process.env.NETGSM_BASE_URL || 'https://api.netgsm.com.tr';

  if (!usercode || !password) {
    console.error('NetGSM credentials or sender info is missing.');
    return false;
  }

  try {
    const url = new URL(`${baseUrl}/sms/send/get`);
    url.searchParams.append('usercode', usercode);
    url.searchParams.append('password', password);
    url.searchParams.append('gsmno', phone);
    url.searchParams.append('message', message);
    url.searchParams.append('msgheader', sender);
    url.searchParams.append('dil', 'TR');

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const result = await response.text();

    // NetGSM "00" ile başlayan yanıtları başarı olarak kabul eder
    if (result.startsWith('00')) {
      // API Kullanım Logger Entegrasyonu (Tahmini SMS başı maliyet 0.005)
      await logApiUsage("NETGSM", "SEND_SMS", 0.005);
      return true;
    } else {
      console.error('NetGSM Error Response:', result);
      return false;
    }
  } catch (error) {
    console.error('NetGSM Fetch Error:', error);
    return false;
  }
}

/**
 * NetGSM bakiye sorgulama servisi
 * @returns Kalan SMS kredi miktarı veya hata durumunda null
 */
export async function getBalance(): Promise<{ amount: number; expiryDate?: string } | null> {
  const settings = await getCachedSettings();
  const usercode = settings?.netgsmUsercode || process.env.NETGSM_USERCODE;
  const password = settings?.netgsmPassword || process.env.NETGSM_PASSWORD;
  const baseUrl = process.env.NETGSM_BASE_URL || 'https://api.netgsm.com.tr';

  if (!usercode || !password) return null;

  try {
    const url = new URL(`${baseUrl}/balance/list/get`);
    url.searchParams.append('usercode', usercode);
    url.searchParams.append('password', password);
    url.searchParams.append('stype', '2'); 

    const response = await fetch(url.toString());
    const result = await response.text();

    if (result.startsWith('00')) {
      const parts = result.split(' ');
      return {
        amount: parseInt(parts[1]) || 0,
        expiryDate: parts[2] || undefined
      };
    }
    return null;
  } catch (error) {
    console.error('NetGSM Balance Error:', error);
    return null;
  }
}

/**
 * NetGSM onaylı gönderici adlarını (header) sorgulama servisi
 */
export async function getSenders(): Promise<string[]> {
  const settings = await getCachedSettings();
  const usercode = settings?.netgsmUsercode || process.env.NETGSM_USERCODE;
  const password = settings?.netgsmPassword || process.env.NETGSM_PASSWORD;
  const baseUrl = process.env.NETGSM_BASE_URL || 'https://api.netgsm.com.tr';

  if (!usercode || !password) return [];

  try {
    const url = new URL(`${baseUrl}/sms/sender/get`);
    url.searchParams.append('usercode', usercode);
    url.searchParams.append('password', password);

    const response = await fetch(url.toString());
    const result = await response.text();

    if (result && !result.includes('error')) {
      // NetGSM genelde her bir göndericiyi yeni satırla döner veya aralarında boşluk olabilir
      // Genellikle "TEKNIKELKMB" gibi direkt string veya liste döner. 
      // Biz güvenli olarak split ile parse edeceğiz.
      const senders = result.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
      return senders;
    }
    return [];
  } catch (error) {
    console.error('NetGSM Senders Error:', error);
    return [];
  }
}
