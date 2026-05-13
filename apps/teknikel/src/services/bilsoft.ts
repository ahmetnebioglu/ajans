import { unsecured_prisma as db } from '@ajans/db';
import { getValidToken as getCentralValidToken } from './tokenManager';

/**
 * Bilsoft API Servis Yapısı
 */
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
 * Otonom Token Yöneticisi: Merkezi TokenManager'ı kullanır.
 */
export async function getValidToken(): Promise<string> {
  return getCentralValidToken('bilsoft');
}


/**
 * Bilsoft'tan cari listesini çeker (Server-Side Pagination & Search).
 * @param searchTerm Arama yapılacak kelime
 * @param page Sayfa numarası (1-indexed)
 * @param pageSize Sayfa başına kayıt sayısı
 */
export async function getBilsoftCariler(
  searchTerm: string = "", 
  page: number = 1, 
  pageSize: number = 50
): Promise<{ data: BilsoftCari[], totalCount: number }> {
  try {
    const token = await getValidToken();
    
    // Temel payload
    const payload: any = {
      subeAdi: 'Merkez',
      pagingOptions: {
        pageSize: pageSize, 
        pageNumber: page - 1, // API 0 tabanlı bekliyor
      },
    };

    // Koşullu Arama Mantığı
    if (searchTerm && searchTerm.trim() !== "") {
      payload.aranacakKelime = searchTerm;
      payload.searchType = ['Contains'];
      payload.veri = { faturaUnvan: searchTerm };
    }

    console.log("🛠️ BİLSOFT FETCH PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await fetch('https://apiv3.bilsoft.com/api/CariKart/getall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const resText = await response.text();
    console.log("🛠️ BİLSOFT HTTP STATUS:", response.status);
    console.log("🛠️ BİLSOFT RAW RESPONSE (İlk 500 karakter):", resText.substring(0, 500));

    let result;
    try {
      result = JSON.parse(resText);
    } catch (e) {
      console.error("🛠️ BİLSOFT JSON Parse Hatası:", e);
      return { data: [], totalCount: 0 };
    }

    if (!result.success) {
      console.warn("🛠️ BİLSOFT API ERROR:", result.message);
      return { data: [], totalCount: 0 };
    }

    return {
      data: result.data || [],
      totalCount: result.totalCount || 0
    };
  } catch (error) {
    console.error('[BilsoftService] Fetch Currents Error:', error);
    return { data: [], totalCount: 0 };
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
export async function getBilsoftTokenStatus() {
  const token = await db.apiToken.findUnique({
    where: { provider: 'bilsoft' }
  });

  return {
    isConnected: !!token,
    expiry: token?.expiresAt.toISOString(),
    lastSync: token?.updatedAt.toISOString(),
  };
}

export interface BilsoftCariInsertPayload {
  id: number;
  firmaId: number;
  cariKod: string;
  cariAd: string;
  cariTip: number;
  vergiDairesi: string;
  vergiNo: string;
  tcKimlikNo: string;
  adres: string;
  il: string;
  ilce: string;
  telefon: string;
  email: string;
  yetkili: string;
  yetkiliTelefon: string;
  aktif: boolean;
}

// ============================================================
// FATURA (BILLS) SERVİSLERİ
// ============================================================

export interface BilsoftFatura {
  id: number;
  unvan: string;
  cariKod: string;
  cariId?: number;
  fatTarih: string;
  toplam: number;
  kdv: number;
  gtoplam: number;
  odemeSekli?: string;
  faturaTuru?: string;
  fisno?: string;
  eFaturaNo?: string;
  eFaturaDurum?: string;
  adres?: string;
  vd?: string;
  vn?: string;
  cariGrup?: string;
  odenen?: number;
  iskonto?: number;
  fatIsl?: BilsoftFaturaKalem[];
}

export interface BilsoftFaturaKalem {
  id?: number;
  sira?: number;
  stokKodu?: string;
  stokAdi?: string;
  aciklama?: string;
  miktar?: number;
  birim?: string;
  birimFiyat?: number;
  kdvOran?: number;
  iskontoOran?: number;
  tutar?: number;
  topfiyat?: number;
  gtopfiyat?: number;
  kdvTutar?: number;
}

/**
 * Bilsoft'tan fatura listesini çeker (Server-Side Pagination & Search).
 */
export async function getBilsoftFaturalar(
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: BilsoftFatura[]; totalCount: number }> {
  try {
    const token = await getValidToken();

    const payload: any = {
      subeAdi: 'Merkez',
      pagingOptions: {
        pageSize,
        pageNumber: page - 1,
      },
    };

    if (searchTerm && searchTerm.trim() !== "") {
      payload.aranacakKelime = searchTerm;
      payload.searchType = ['Contains'];
    }

    const response = await fetch('https://apiv3.bilsoft.com/api/Fatura/getall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const resText = await response.text();
    let result;
    try {
      result = JSON.parse(resText);
    } catch {
      console.error('[BilsoftService] Fatura JSON Parse Hatası');
      return { data: [], totalCount: 0 };
    }

    if (!result.success) {
      console.warn('[BilsoftService] Fatura API ERROR:', result.message);
      return { data: [], totalCount: 0 };
    }

    // API yanıtı: result.data.data (array) + result.data.totalCount
    const rawData = result.data?.data ?? result.data ?? [];
    const totalCount = result.data?.totalCount ?? result.totalCount ?? rawData.length;

    // ID'ye göre azalan sıralama (en yeni fatura başta)
    const sorted = [...rawData].sort((a: any, b: any) => b.id - a.id);

    return { data: sorted, totalCount };
  } catch (error) {
    console.error('[BilsoftService] Fetch Faturalar Error:', error);
    return { data: [], totalCount: 0 };
  }
}

/**
 * Bilsoft'tan ID ile tekil fatura detayı çeker.
 */
export async function getBilsoftFaturaById(id: string | number): Promise<BilsoftFatura | null> {
  try {
    const token = await getValidToken();
    const numericId = typeof id === 'string' ? parseInt(id) : id;

    const response = await fetch(
      `https://apiv3.bilsoft.com/api/Fatura/getbyid?id=${numericId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const result = await response.json();

    if (result?.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('[BilsoftService] Fetch Fatura Detail Error:', error);
    return null;
  }
}

// ============================================================
// STOK KARTI SERVİSLERİ
// ============================================================

export interface BilsoftStokKarti {
  id?: number;
  kod: string;
  ad: string;
  barkod?: string;
  birim?: string;
  grup?: string;
  sFiyat?: number;
  aFiyat?: number;
  kdvOran?: number;
  kdvDahil?: string;
  bakiye?: number;
  giris?: number;
  cikis?: number;
  stokRafi?: string;
  stokMarka?: string;
  stokOzelKod1?: string;
  stokOzelKod2?: string;
  subeAdi?: string;
  kullaniciAdi?: string;
  otvOran?: string;
  oivOran?: string;
  resimYolu?: string;
  aliciUrunKodu?: string;
  saticiUrunKodu?: string;
}

/**
 * Bilsoft'tan stok kartı listesini çeker (Server-Side Pagination & Search).
 */
export async function getBilsoftStokKartlari(
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: BilsoftStokKarti[]; totalCount: number }> {
  try {
    const token = await getValidToken();

    const payload: any = {
      aranacakKelime: searchTerm && searchTerm.trim() !== "" ? searchTerm : '',
      searchType: ['Contains'],
      subeAdi: 'Merkez',
      pagingOptions: {
        pageSize: pageSize,
        pageNumber: page - 1,
      },
      veri: {
        kod: '',
      },
    };

    console.log("🛠️ BİLSOFT STOK FETCH PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await fetch('https://apiv3.bilsoft.com/api/Stok/GetListWithBakiye', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const resText = await response.text();
    console.log("🛠️ BİLSOFT STOK HTTP STATUS:", response.status);
    console.log("🛠️ BİLSOFT STOK RAW RESPONSE (İlk 500 karakter):", resText.substring(0, 500));

    let result;
    try {
      result = JSON.parse(resText);
    } catch {
      console.error('[BilsoftService] StokKart JSON Parse Hatası');
      return { data: [], totalCount: 0 };
    }

    if (!result.success) {
      console.warn('[BilsoftService] StokKart API ERROR:', result.message);
      return { data: [], totalCount: 0 };
    }

    const rawData = result.data?.data ?? result.data ?? [];
    const totalCount = result.data?.totalCount ?? result.totalCount ?? rawData.length;

    console.log(`🛠️ BİLSOFT STOK: ${rawData.length} kayıt, toplam: ${totalCount}`);

    return { data: rawData, totalCount };
  } catch (error) {
    console.error('[BilsoftService] Fetch StokKartlari Error:', error);
    return { data: [], totalCount: 0 };
  }
}

/**
 * Bilsoft'tan stok kodu ile tekil stok kartı detayı çeker.
 */
export async function getBilsoftStokById(kod: string): Promise<BilsoftStokKarti | null> {
  try {
    const token = await getValidToken();

    const response = await fetch('https://apiv3.bilsoft.com/api/Stok/GetListWithBakiye', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        aranacakKelime: kod,
        searchType: ['Equals'],
        subeAdi: 'Merkez',
        pagingOptions: { pageSize: 10, pageNumber: 0 },
        veri: { kod: kod },
      }),
      cache: 'no-store',
    });

    const result = await response.json();
    if (!result.success) return null;

    const rawData = result.data?.data ?? result.data ?? [];
    // Tam eşleşmeyi bul
    const exact = rawData.find((s: any) => s.kod === kod);
    return exact ?? (rawData.length > 0 ? rawData[0] : null);
  } catch (error) {
    console.error('[BilsoftService] Fetch StokKart Detail Error:', error);
    return null;
  }
}

/**
 * Bilsoft'a yeni cari kartı ekler.
 */
export async function addBilsoftCari(payload: Partial<BilsoftCariInsertPayload>): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getValidToken();
    
    // Varsayılan değerlerle birleştir (Zorunlu alanlar için fallback)
    const finalPayload = {
      id: 0,
      firmaId: 0,
      cariKod: payload.cariKod || `C${Date.now().toString().slice(-6)}`,
      cariAd: payload.cariAd || "",
      cariTip: 1,
      vergiDairesi: payload.vergiDairesi || "",
      vergiNo: payload.vergiNo || "",
      tcKimlikNo: "",
      adres: payload.adres || "",
      il: payload.il || "",
      ilce: payload.ilce || "",
      telefon: payload.telefon || "",
      email: payload.email || "",
      yetkili: payload.yetkili || "",
      yetkiliTelefon: payload.yetkiliTelefon || "",
      aktif: true,
      ...payload
    };

    const response = await fetch('https://apiv3.bilsoft.com/api/CariKart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(finalPayload),
    });

    const result = await response.json();
    return {
      success: result.success,
      message: result.message || (result.success ? "Cari başarıyla eklendi." : "Cari eklenirken bir hata oluştu.")
    };
  } catch (error) {
    console.error('[BilsoftService] Add Cari Error:', error);
    return { success: false, message: "Bağlantı hatası oluştu." };
  }
}

// ============================================================
// FATURA OLUŞTURMA SERVİSLERİ
// ============================================================

/**
 * Bilsoft'a fatura ekler.
 */
export async function createBilsoftFatura(payload: any): Promise<{ success: boolean; data?: any; message: string }> {
  try {
    const token = await getValidToken();

    const response = await fetch('https://apiv3.bilsoft.com/api/Fatura/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const result = await response.json();
    return {
      success: result.success,
      data: result.data,
      message: result.message || (result.success ? "Fatura başarıyla oluşturuldu." : "Fatura oluşturulurken bir hata oluştu.")
    };
  } catch (error) {
    console.error('[BilsoftService] Create Fatura Error:', error);
    return { success: false, message: "Bağlantı hatası oluştu." };
  }
}

/**
 * Bilsoft'ta fatura arar (duplicate kontrol için).
 */
export async function searchBilsoftFatura(payload: any): Promise<{ success: boolean; data?: any[]; message: string }> {
  try {
    const token = await getValidToken();

    const response = await fetch('https://apiv3.bilsoft.com/api/Fatura/getall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const result = await response.json();
    return {
      success: result.success,
      data: result.data || [],
      message: result.message || (result.success ? "Arama başarılı." : "Arama sırasında bir hata oluştu.")
    };
  } catch (error) {
    console.error('[BilsoftService] Search Fatura Error:', error);
    return { success: false, data: [], message: "Bağlantı hatası oluştu." };
  }
}
