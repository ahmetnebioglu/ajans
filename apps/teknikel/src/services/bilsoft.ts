import { unsecured_prisma as db } from '@ajans/db';
import { getValidToken as getCentralValidToken } from './tokenManager';
import { unstable_cache } from 'next/cache';
import zlib from 'zlib';

function compressData(data: any): string {
  const str = JSON.stringify(data);
  return zlib.gzipSync(str).toString('base64');
}

function decompressData(base64Str: string): any {
  if (!base64Str) return [];
  const buffer = Buffer.from(base64Str, 'base64');
  const decompressed = zlib.gunzipSync(buffer);
  return JSON.parse(decompressed.toString('utf-8'));
}

// ============================================================
// SKU NORMALIZATION & CACHING
// ============================================================

/**
 * Normalizes SKU values for consistent comparison
 * Handles spaces, dashes, underscores, dots, and Turkish characters
 */
const normalizationCache = new Map<string, string>();

export function normalizeSkuForComparison(value: string | null | undefined): string {
  if (!value) return '';

  const cacheKey = String(value);
  if (normalizationCache.has(cacheKey)) {
    return normalizationCache.get(cacheKey)!;
  }

  let normalized = typeof value === 'string' ? value.trim() : String(value).trim();
  normalized = normalized
    .toLowerCase()
    .replace(/[\s\-_\.]+/g, '') // Remove spaces, dashes, underscores, dots
    .replace(/[^\w\d]/g, ''); // Remove non-alphanumeric characters

  if (normalizationCache.size < 10000) {
    normalizationCache.set(cacheKey, normalized);
  }

  return normalized;
}

// Global stock cache
let globalStockCache: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Fetches and caches all Bilsoft stock cards
 * Uses pagination to handle large datasets
 */
export async function fetchAndCacheBilsoftStocks(force: boolean = false): Promise<any[]> {
  const now = Date.now();
  
  // Return cached data if still valid and not forced
  if (!force && globalStockCache && (now - lastCacheTime < CACHE_TTL)) {
    console.log('[bilsoft.ts] Returning cached stocks');
    return globalStockCache;
  }

  try {
    const token = await getValidToken();
    console.log('[bilsoft.ts] Fetching all stock cards from Bilsoft...');

    let allStocks: any[] = [];
    let page = 1;
    const pageSize = 1500;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch('https://apiv3.bilsoft.com/api/Stok/GetListWithBakiye', {
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
            pageSize,
            pageNumber: page - 1,
          },
          veri: { kod: '' },
        }),
        cache: 'no-store',
      });

      const result = await response.json();
      if (!result.success) {
        console.warn('[bilsoft.ts] Stock fetch failed:', result.message);
        break;
      }

      const rawData = result.data?.data ?? result.data ?? [];
      allStocks = allStocks.concat(rawData);

      const totalCount = result.data?.totalCount ?? result.totalCount ?? 0;
      if (rawData.length < pageSize || allStocks.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    }

    globalStockCache = allStocks;
    lastCacheTime = Date.now();
    console.log(`[bilsoft.ts] Cached ${allStocks.length} stock cards`);
    return allStocks;
  } catch (error) {
    console.error('[bilsoft.ts] Cache fetch error:', error);
    if (globalStockCache) return globalStockCache;
    throw error;
  }
}

/**
 * Gets stock card detail by SKU code
 * Uses in-memory cache with normalized comparison
 */
export async function getBilsoftStockCardDetail(options: {
  stokKodu: string;
  forceRefresh?: boolean;
}): Promise<{ success: boolean; data: any | null; message: string }> {
  try {
    const { stokKodu, forceRefresh = false } = options;
    if (!stokKodu) {
      return { success: false, data: null, message: 'Stock code is required' };
    }

    const normalizedStokKodu = normalizeSkuForComparison(stokKodu);
    const allStocks = await fetchAndCacheBilsoftStocks(forceRefresh);

    if (!allStocks || allStocks.length === 0) {
      return { success: false, data: null, message: 'Stock list is empty' };
    }

    // Search in memory with normalized comparison
    const matchingStock = allStocks.find((stock) => {
      const stockKodNorm = normalizeSkuForComparison(stock.kod);
      const stockBarkodNorm = normalizeSkuForComparison(stock.barkod);
      return stockKodNorm === normalizedStokKodu || stockBarkodNorm === normalizedStokKodu;
    });

    if (matchingStock) {
      console.log(`[bilsoft.ts] Found stock from cache: ${stokKodu} -> ${matchingStock.kod}`);
      return {
        success: true,
        data: matchingStock,
        message: 'Stock card found',
      };
    }

    return {
      success: false,
      data: null,
      message: `Stock code "${stokKodu}" not found in ${allStocks.length} records`,
    };
  } catch (error) {
    console.error(`[bilsoft.ts] Stock search error (${options.stokKodu}):`, error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Error occurred',
    };
  }
}

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
const _fetchAllBilsoftCariler = async (): Promise<string> => {
  try {
    const token = await getValidToken();
    let allCariler: BilsoftCari[] = [];
    let page = 1;
    const pageSize = 1500;
    let hasMore = true;

    while (hasMore) {
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
            pageSize,
            pageNumber: page - 1,
          },
        }),
        cache: 'no-store',
      });

      const result = await response.json();
      if (!result.success) {
        console.warn('[bilsoft.ts] Cari fetch failed:', result.message);
        break;
      }

      const rawData: BilsoftCari[] = result.data || [];
      allCariler = allCariler.concat(rawData);

      const totalCount = result.totalCount || 0;
      if (rawData.length < pageSize || allCariler.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return compressData(allCariler);
  } catch (error) {
    console.error('[bilsoft.ts] Fetch All Caris Error:', error);
    return compressData([]);
  }
};

const getCachedAllCariler = unstable_cache(
  _fetchAllBilsoftCariler,
  ['bilsoft-all-cariler'],
  { revalidate: 86400, tags: ['bilsoft-cariler'] }
);

export async function getBilsoftCariler(
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: BilsoftCari[]; totalCount: number }> {
  const compressed = await getCachedAllCariler();
  const allCariler = decompressData(compressed) as BilsoftCari[];
  let filtered = allCariler;

  if (searchTerm && searchTerm.trim() !== "") {
    const cleanTerm = normalizeString(searchTerm);
    const cleanPhoneTerm = normalizePhone(searchTerm);
    
    filtered = allCariler.filter(cari => {
      const unvan = normalizeString(cari.faturaUnvan);
      const kod = normalizeString(cari.cariKod);
      const yetkili = normalizeString(cari.yetkili);
      const tel = normalizePhone(cari.tel);
      const cep = normalizePhone(cari.cep);
      
      return (
        unvan.includes(cleanTerm) ||
        kod.includes(cleanTerm) ||
        yetkili.includes(cleanTerm) ||
        (cleanPhoneTerm && (tel.includes(cleanPhoneTerm) || cep.includes(cleanPhoneTerm)))
      );
    });
  }

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: paginated,
    totalCount: filtered.length
  };
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
const _fetchAllBilsoftFaturalar = async (): Promise<string> => {
  try {
    const token = await getValidToken();
    let allFaturalar: BilsoftFatura[] = [];
    let page = 1;
    const pageSize = 1500;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch('https://apiv3.bilsoft.com/api/Fatura/getall', {
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
            pageSize,
            pageNumber: page - 1,
          },
        }),
        cache: 'no-store',
      });

      const result = await response.json();
      if (!result.success) {
        console.warn('[bilsoft.ts] Fatura fetch failed:', result.message);
        break;
      }

      const rawData = result.data?.data ?? result.data ?? [];
      allFaturalar = allFaturalar.concat(rawData);

      const totalCount = result.data?.totalCount ?? result.totalCount ?? 0;
      if (rawData.length < pageSize || allFaturalar.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return compressData(allFaturalar.sort((a, b) => b.id - a.id));
  } catch (error) {
    console.error('[bilsoft.ts] Fetch All Faturalar Error:', error);
    return compressData([]);
  }
};

const getCachedAllFaturalar = unstable_cache(
  _fetchAllBilsoftFaturalar,
  ['bilsoft-all-faturalar'],
  { revalidate: 7200, tags: ['bilsoft-faturalar'] }
);

export async function getBilsoftFaturalar(
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: BilsoftFatura[]; totalCount: number }> {
  const compressed = await getCachedAllFaturalar();
  const allFaturalar = decompressData(compressed) as BilsoftFatura[];
  let filtered = allFaturalar;

  if (searchTerm && searchTerm.trim() !== "") {
    const term = normalizeString(searchTerm);
    filtered = allFaturalar.filter(fat => {
      const unvan = normalizeString(fat.unvan);
      const cariKod = normalizeString(fat.cariKod);
      const fisno = normalizeString(fat.fisno);
      const eFaturaNo = normalizeString(fat.eFaturaNo);
      return (
        unvan.includes(term) ||
        cariKod.includes(term) ||
        fisno.includes(term) ||
        eFaturaNo.includes(term)
      );
    });
  }

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: paginated,
    totalCount: filtered.length
  };
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
// FATURA OLUŞTURMA VE RAPORLAMA SERVİSLERİ
// ============================================================

/**
 * Belirli bir cari ID'si için sadece en son faturayı çeker.
 * (Cron job vb. arka plan görevleri için optimize edilmiştir)
 */
export async function getBilsoftLatestInvoiceForCari(cariId: string | number): Promise<string | null> {
  try {
    const token = await getValidToken();

    const response = await fetch('https://apiv3.bilsoft.com/api/Fatura/getall', {
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
          pageSize: 1, // Sadece en sonuncuyu istiyoruz
          pageNumber: 0,
        },
        veri: { cariId },
      }),
      cache: 'no-store',
    });

    const result = await response.json();
    
    if (result.success && result.data && result.data.data && result.data.data.length > 0) {
      // API faturayı döndürdüğünde tarihini al
      const latestInvoice = result.data.data[0];
      return latestInvoice.fatTarih || null;
    }
    
    return null;
  } catch (error) {
    console.error(`[BilsoftService] Cari ${cariId} için fatura çekilemedi:`, error);
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
const _fetchAllBilsoftStokKartlari = async (): Promise<string> => {
  try {
    const token = await getValidToken();
    let allStoklar: BilsoftStokKarti[] = [];
    let page = 1;
    const pageSize = 1500;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch('https://apiv3.bilsoft.com/api/Stok/GetListWithBakiye', {
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
            pageSize,
            pageNumber: page - 1,
          },
          veri: {
            kod: '',
          },
        }),
        cache: 'no-store',
      });

      const result = await response.json();
      if (!result.success) {
        console.warn('[bilsoft.ts] Stok fetch failed:', result.message);
        break;
      }

      const rawData = result.data?.data ?? result.data ?? [];
      allStoklar = allStoklar.concat(rawData);

      const totalCount = result.data?.totalCount ?? result.totalCount ?? 0;
      if (rawData.length < pageSize || allStoklar.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return compressData(allStoklar);
  } catch (error) {
    console.error('[bilsoft.ts] Fetch All Stoklar Error:', error);
    return compressData([]);
  }
};

const getCachedAllStokKartlari = unstable_cache(
  _fetchAllBilsoftStokKartlari,
  ['bilsoft-all-stoklar'],
  { revalidate: 43200, tags: ['bilsoft-stoklar'] }
);

export async function getBilsoftStokKartlari(
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: BilsoftStokKarti[]; totalCount: number }> {
  const compressed = await getCachedAllStokKartlari();
  const allStoklar = decompressData(compressed) as BilsoftStokKarti[];
  let filtered = allStoklar;

  if (searchTerm && searchTerm.trim() !== "") {
    const term = normalizeString(searchTerm);
    filtered = allStoklar.filter(stok => {
      const kod = normalizeString(stok.kod);
      const ad = normalizeString(stok.ad);
      const barkod = normalizeString(stok.barkod);
      return (
        kod.includes(term) ||
        ad.includes(term) ||
        barkod.includes(term)
      );
    });
  }

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: paginated,
    totalCount: filtered.length
  };
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
