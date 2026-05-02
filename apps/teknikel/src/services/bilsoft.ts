import { unsecured_prisma as db } from '@ajans/db';

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

// globalThis için tip tanımları
declare global {
  var bilsoftToken: string | undefined;
  var bilsoftTokenExpiry: string | undefined;
  var bilsoftLastSync: string | undefined;
}

/**
 * Telefon numarasını sadece rakamlardan oluşacak şekilde temizler.
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('90')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return cleaned;
}

/**
 * Metni karşılaştırma için normalize eder.
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
    .replace(/\s+/g, '');
}

/**
 * Otonom Token Yöneticisi: Token'ı kontrol eder, süresi dolmuşsa yeniler.
 */
export async function getValidToken(): Promise<string> {
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 dakika emniyet payı

  // 1. Önbellekte geçerli token var mı kontrol et
  if (
    globalThis.bilsoftToken &&
    globalThis.bilsoftTokenExpiry &&
    new Date(globalThis.bilsoftTokenExpiry).getTime() > now.getTime() + bufferTime
  ) {
    return globalThis.bilsoftToken;
  }

  console.log('[BilsoftService] Token geçersiz veya süresi dolmuş, yenileniyor...');

  // 2. Kimlik bilgilerini getir (Önce DB, sonra ENV)
  const dbConfig = await db.bilsoftConfig.findUnique({
    where: { tenantId: 'teknikel' }
  });

  const credentials = {
    apiKullaniciAdi: dbConfig?.apiUser || process.env.BILSOFT_API_USER,
    apiKullaniciSifre: dbConfig?.apiPassword || process.env.BILSOFT_API_PASSWORD,
    donemYil: dbConfig?.year || process.env.BILSOFT_YEAR,
    kullaniciAdi: dbConfig?.user || process.env.BILSOFT_USER,
    kullaniciSifre: dbConfig?.password || process.env.BILSOFT_PASSWORD,
    subeAd: dbConfig?.branch || process.env.BILSOFT_BRANCH,
    vergiNumarasi: dbConfig?.taxNumber || process.env.BILSOFT_TAX_NUMBER,
    veritabaniAd: dbConfig?.dbName || process.env.BILSOFT_DB_NAME,
  };

  if (!credentials.apiKullaniciAdi || !credentials.kullaniciAdi) {
    throw new Error('Bilsoft kimlik bilgileri eksik (DB veya ENV).');
  }

  try {
    const response = await fetch('https://apiv3.bilsoft.com/api/Auth/GirisYap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });

    const result: BilsoftAuthResponse = await response.json();

    if (!result.success || !result.data?.token) {
      throw new Error(result.message || 'Bilsoft login failed');
    }

    // 3. Global önbelleği güncelle
    globalThis.bilsoftToken = result.data.token;
    globalThis.bilsoftTokenExpiry = result.data.expiration;
    globalThis.bilsoftLastSync = new Date().toISOString();

    return result.data.token;
  } catch (error) {
    console.error('[BilsoftService] Token Refresh Error:', error);
    throw error;
  }
}

/**
 * Bilsoft'tan tüm cari listesini çeker.
 */
export async function getBilsoftCariler(): Promise<BilsoftCari[]> {
  try {
    const token = await getValidToken();
    
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

/**
 * Bilsoft'tan ID ile tekil cari detayı çeker.
 */
export async function getBilsoftCariById(id: string | number): Promise<any> {
  try {
    const token = await getValidToken();
    
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
        veri: {
          id: typeof id === 'string' ? parseInt(id) : id,
        },
        pagingOptions: {
          pageSize: 1, 
          pageNumber: 0,
        },
      }),
    });

    const result = await response.json();
    if (!result.success || !result.data || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Failed to fetch cari detail');
    }

    // ID'ye göre filtrelediğimiz için ilk elemanı döndürüyoruz
    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('[BilsoftService] Fetch Cari Detail Error:', error);
    return null;
  }
}

/**
 * Mevcut token durumunu döner (Server Action için).
 */
export function getBilsoftTokenStatus() {
  return {
    isConnected: !!globalThis.bilsoftToken,
    expiry: globalThis.bilsoftTokenExpiry,
    lastSync: globalThis.bilsoftLastSync,
  };
}
