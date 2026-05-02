import { unstable_cache } from 'next/cache';

/**
 * Bilsoft API Servis Yapısı
 */

interface BilsoftAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    expiration: string;
  };
}

export interface BilsoftCari {
  id: number;
  cariKod: string;
  faturaUnvan: string;
  yetkili: string;
  cep: string;
  tel: string;
  mail: string;
  grup: string;
  bakiye?: number;
}

/**
 * Telefon numarasını sadece rakamlardan oluşacak şekilde temizler.
 * Başındaki +90 veya 0 karakterlerini de siler.
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  // Sadece rakamları al
  let cleaned = phone.replace(/\D/g, '');
  // Başındaki 90'ı sil (e-posta veya ülke kodu gibi)
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  // Başındaki 0'ı sil
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Metni karşılaştırma için normalize eder (Türkçe karakterleri ASCII'ye çevirir, küçük harfe dönüştürür).
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ''); // Boşlukları da kaldırıyoruz daha iyi eşleşme için
}

/**
 * Bilsoft API Token'ını önbelleğe alarak getirir.
 */
export const getBilsoftToken = unstable_cache(
  async () => {
    const data = {
      apiKullaniciAdi: process.env.BILSOFT_API_USER,
      apiKullaniciSifre: process.env.BILSOFT_API_PASSWORD,
      donemYil: process.env.BILSOFT_YEAR,
      kullaniciAdi: process.env.BILSOFT_USER,
      kullaniciSifre: process.env.BILSOFT_PASSWORD,
      subeAd: process.env.BILSOFT_BRANCH,
      vergiNumarasi: process.env.BILSOFT_TAX_NUMBER,
      veritabaniAd: process.env.BILSOFT_DB_NAME,
    };

    try {
      const response = await fetch('https://apiv3.bilsoft.com/api/Auth/GirisYap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: BilsoftAuthResponse = await response.json();

      if (!result.success || !result.data?.token) {
        throw new Error(result.message || 'Bilsoft login failed');
      }

      return {
        token: result.data.token,
        expiration: result.data.expiration,
      };
    } catch (error) {
      console.error('[BilsoftService] Auth Error:', error);
      throw error;
    }
  },
  ['bilsoft-token'],
  { revalidate: 3000 } // 50 dakika (Token genelde 1 saat geçerlidir)
);

/**
 * Bilsoft'tan tüm cari listesini çeker.
 */
export async function fetchBilsoftCurrents(): Promise<BilsoftCari[]> {
  try {
    const { token } = await getBilsoftToken();
    
    const response = await fetch('https://apiv3.bilsoft.com/api/CariKart/getall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        aranacakKelime: '',
        searchType: ['Contains'],
        subeAdi: 'Merkez',
        pagingOptions: {
          pageSize: 5000, 
          pageNumber: 0,
        },
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch currents');
    }

    return result.data || [];
  } catch (error) {
    console.error('[BilsoftService] Fetch Currents Error:', error);
    return [];
  }
}
