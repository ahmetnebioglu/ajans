'use server';

import { revalidatePath } from 'next/cache';
import {
  getIdeasoftAllProducts,
  updateIdeasoftProduct,
} from '@/src/services/ideasoft';
import { getBilsoftStokKartlari } from '@/src/services/bilsoft';
import { calculateEnhancedSimilarity, normalizeSkuForComparison } from '@/src/utils/similarity';

// ============================================================================
// TYPES
// ============================================================================

interface BilsoftStokKarti {
  kod: string;
  ad: string;
  sFiyat?: number;
  aFiyat?: number;
  stokOzelKod1?: number | string;
  stokOzelKod2?: number | string;
  bakiye?: number;
}

interface IdeasoftProduct {
  id: number;
  sku: string;
  name: string;
  price1?: number;
  price2?: number;
  price3?: number;
  stockAmount?: number;
}

interface SyncPair {
  bilsoftKod: string;
  bilsoftAd: string;
  bilsoftSFiyat?: number;
  bilsoftStokOzelKod1?: number;
  bilsoftStokOzelKod2?: number;
  bilsoftBakiye?: number;
  ideasoftId: number;
  ideasoftName: string;
  ideasoftSku: string;
}

interface PreCheckResult {
  success: boolean;
  message: string;
  validPairs: SyncPair[];
  notFoundSkus: Array<{ kod: string; ad: string }>;
  invalidSkus: Array<{ kod: string; ad: string; reason: string }>;
  totalBilsoft: number;
  totalIdeasoft: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  totalBilsoftItems: number;
  totalIdeasoftItems: number;
  matchedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ sku: string; error: string }>;
}

interface SingleSyncPreview {
  success: boolean;
  message: string;
  bilsoftData?: {
    kod: string;
    ad: string;
    sFiyat?: number;
    stokOzelKod1?: number;
    stokOzelKod2?: number;
    bakiye?: number;
  };
  ideasoftData?: {
    id: number;
    sku: string;
    name: string;
    price1?: number;
    price2?: number;
    price3?: number;
    stockAmount?: number;
  };
  calculatedValues?: {
    price1: number;
    price2: number;
    price3: number;
    stockAmount: number;
    moneyOrderDiscount: number;
  };
  commissionCalculation?: {
    commissionFactor: number;
    basePrice1: number;
    basePrice2: number;
    basePrice3: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fiyat hesaplama: havale indirimine göre kredi kartı fiyatını hesapla
 */
function calculateCreditCardPrice(basePrice: number | undefined, discountPercent: number): number {
  if (!basePrice || basePrice <= 0) return 0;
  const commissionFactor = 1 - discountPercent / 100;
  if (commissionFactor <= 0) return 0;
  return basePrice / commissionFactor;
}

/**
 * Bilsoft stok kartını doğrula
 */
function validateBilsoftStok(stok: BilsoftStokKarti): { valid: boolean; reason?: string } {
  // Stok kodu boş ise geçersiz
  if (!stok.kod || stok.kod.trim() === '') {
    return { valid: false, reason: 'Stok kodu boş' };
  }

  // En az bir fiyat alanı dolu olmalı
  const hasPriceData =
    (stok.sFiyat && stok.sFiyat > 0) ||
    (stok.stokOzelKod1 && parseFloat(String(stok.stokOzelKod1)) > 0) ||
    (stok.stokOzelKod2 && parseFloat(String(stok.stokOzelKod2)) > 0);

  if (!hasPriceData) {
    return { valid: false, reason: 'Fiyat verisi yok' };
  }

  return { valid: true };
}

/**
 * Bilsoft ve Ideasoft'u eşleştir (SKU bazında)
 */
function matchBilsoftToIdeasoft(
  bilsoftStoks: BilsoftStokKarti[],
  ideasoftProducts: IdeasoftProduct[]
): {
  pairs: SyncPair[];
  notFound: Array<{ kod: string; ad: string }>;
  invalid: Array<{ kod: string; ad: string; reason: string }>;
} {
  const ideasoftBySku = new Map<string, IdeasoftProduct>();
  for (const product of ideasoftProducts) {
    if (product.sku) {
      ideasoftBySku.set(product.sku.toUpperCase(), product);
    }
  }

  const pairs: SyncPair[] = [];
  const notFound: Array<{ kod: string; ad: string }> = [];
  const invalid: Array<{ kod: string; ad: string; reason: string }> = [];

  for (const bilsoft of bilsoftStoks) {
    // Doğrulama
    const validation = validateBilsoftStok(bilsoft);
    if (!validation.valid) {
      invalid.push({
        kod: bilsoft.kod,
        ad: bilsoft.ad,
        reason: validation.reason || 'Bilinmeyen hata',
      });
      continue;
    }

    // Eşleştirme
    const ideasoft = ideasoftBySku.get(bilsoft.kod.toUpperCase());
    if (!ideasoft) {
      notFound.push({
        kod: bilsoft.kod,
        ad: bilsoft.ad,
      });
      continue;
    }

    // Başarılı eşleştirme
    pairs.push({
      bilsoftKod: bilsoft.kod,
      bilsoftAd: bilsoft.ad,
      bilsoftSFiyat: bilsoft.sFiyat,
      bilsoftStokOzelKod1: bilsoft.stokOzelKod1 ? parseFloat(String(bilsoft.stokOzelKod1)) : undefined,
      bilsoftStokOzelKod2: bilsoft.stokOzelKod2 ? parseFloat(String(bilsoft.stokOzelKod2)) : undefined,
      bilsoftBakiye: bilsoft.bakiye ? parseFloat(String(bilsoft.bakiye)) : 0,
      ideasoftId: ideasoft.id,
      ideasoftName: ideasoft.name,
      ideasoftSku: ideasoft.sku,
    });
  }

  return { pairs, notFound, invalid };
}

// ============================================================================
// TOPLU SİNKRONİZASYON (BULK SYNC)
// ============================================================================

/**
 * Toplu senkronizasyon öncesi kontrol: Bilsoft ve Ideasoft'u çeker, eşleştirir
 * Sonuç: Geçerli çiftler, bulunamayan SKU'lar, geçersiz stoklar
 */
export async function preCheckBulkSync(havaleIndirimi: number): Promise<PreCheckResult> {
  const result: PreCheckResult = {
    success: false,
    message: '',
    validPairs: [],
    notFoundSkus: [],
    invalidSkus: [],
    totalBilsoft: 0,
    totalIdeasoft: 0,
  };

  try {
    console.log('[BulkSync] Ön kontrol başlatıldı...');

    // 1. Bilsoft'tan tüm stok kartlarını çek
    console.log('[BulkSync] Bilsoft stok kartları çekiliyor...');
    const { data: bilsoftStoks } = await getBilsoftStokKartlari('', 1, 5000);
    if (!bilsoftStoks || bilsoftStoks.length === 0) {
      result.message = 'Bilsoft stok kartları alınamadı veya boş.';
      return result;
    }
    result.totalBilsoft = bilsoftStoks.length;
    console.log(`[BulkSync] ${bilsoftStoks.length} Bilsoft stok kartı bulundu.`);

    // 2. Ideasoft'tan tüm ürünleri çek
    console.log('[BulkSync] Ideasoft ürünleri çekiliyor...');
    const ideasoftProducts = await getIdeasoftAllProducts(100);
    if (!ideasoftProducts || ideasoftProducts.length === 0) {
      result.message = 'Ideasoft ürünleri alınamadı veya boş.';
      return result;
    }
    result.totalIdeasoft = ideasoftProducts.length;
    console.log(`[BulkSync] ${ideasoftProducts.length} Ideasoft ürünü bulundu.`);

    // 3. Eşleştirme
    console.log('[BulkSync] Eşleştirme yapılıyor...');
    const { pairs, notFound, invalid } = matchBilsoftToIdeasoft(bilsoftStoks, ideasoftProducts);

    result.validPairs = pairs;
    result.notFoundSkus = notFound;
    result.invalidSkus = invalid;
    result.success = true;
    result.message = `Ön kontrol tamamlandı. Geçerli: ${pairs.length}, Bulunamadı: ${notFound.length}, Geçersiz: ${invalid.length}`;

    console.log('[BulkSync] Ön kontrol tamamlandı:', result);
    return result;
  } catch (error) {
    console.error('[BulkSync] Kritik hata:', error);
    result.message = `Ön kontrol hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
    return result;
  }
}

/**
 * Toplu senkronizasyon: Eşleşen çiftleri güncelle
 */
export async function executeBulkSync(
  pairs: SyncPair[],
  havaleIndirimi: number
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    totalBilsoftItems: 0,
    totalIdeasoftItems: 0,
    matchedCount: pairs.length,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
  };

  try {
    console.log(`[BulkSync] Senkronizasyon başlatıldı (${pairs.length} çift)...`);

    for (const pair of pairs) {
      try {
        // Fiyat hesapla
        const price1 = pair.bilsoftStokOzelKod1
          ? calculateCreditCardPrice(pair.bilsoftStokOzelKod1, havaleIndirimi)
          : 0;
        const price2 = pair.bilsoftSFiyat
          ? calculateCreditCardPrice(pair.bilsoftSFiyat, havaleIndirimi)
          : 0;
        const price3 = pair.bilsoftStokOzelKod2
          ? calculateCreditCardPrice(pair.bilsoftStokOzelKod2, havaleIndirimi)
          : 0;
        const stockAmount = pair.bilsoftBakiye || 0;

        // Güncellenecek veri hazırla
        const updateData: any = {
          stockAmount,
          moneyOrderDiscount: havaleIndirimi,
        };

        if (price1 > 0) updateData.price1 = price1;
        if (price2 > 0) updateData.price2 = price2;
        if (price3 > 0) updateData.price3 = price3;

        // Ideasoft'u güncelle
        const updateResult = await updateIdeasoftProduct(pair.ideasoftId, updateData);
        if (updateResult) {
          result.updatedCount++;
          console.log(
            `[BulkSync] Güncellendi: ${pair.bilsoftKod} (Stok: ${stockAmount}, Price1: ${price1.toFixed(2)}, Price2: ${price2.toFixed(2)}, Price3: ${price3.toFixed(2)})`
          );
        } else {
          result.errorCount++;
          result.errors.push({
            sku: pair.bilsoftKod,
            error: 'Ideasoft güncellemesi başarısız',
          });
          console.error(`[BulkSync] Güncelleme başarısız: ${pair.bilsoftKod}`);
        }
      } catch (itemError: any) {
        result.errorCount++;
        result.errors.push({
          sku: pair.bilsoftKod,
          error: itemError.message || 'Bilinmeyen hata',
        });
        console.error(`[BulkSync] Hata (${pair.bilsoftKod}):`, itemError);
      }
    }

    result.success = true;
    result.message = `Senkronizasyon tamamlandı. Güncellenen: ${result.updatedCount}, Hata: ${result.errorCount}`;

    console.log('[BulkSync] Senkronizasyon tamamlandı:', result);
    revalidatePath('/stoklar');

    return result;
  } catch (error) {
    console.error('[BulkSync] Kritik hata:', error);
    result.message = `Senkronizasyon hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
    return result;
  }
}

// ============================================================================
// STOK-IDEASOFT EŞLEŞTİRME (MATCHING)
// ============================================================================

/**
 * Bilsoft stok kodunu SKU olarak Ideasoft'ta arar
 * Önce birebir eşleşme arar, bulamazsa yakın eşleşme (fuzzy match) dener.
 */
export async function findIdeasoftMatchForStok(bilsoftKod: string): Promise<{
  found: boolean;
  isExactMatch?: boolean;
  ideasoftId?: number;
  ideasoftName?: string;
  ideasoftSku?: string;
  similarityScore?: number;
  message: string;
}> {
  try {
    console.log(`[StokMatch] Ideasoft eşleşmesi aranıyor: ${bilsoftKod}`);

    // Ideasoft'tan tüm ürünleri çek
    const ideasoftProducts = await getIdeasoftAllProducts(100);
    if (!ideasoftProducts || ideasoftProducts.length === 0) {
      return {
        found: false,
        message: 'Ideasoft ürünleri alınamadı',
      };
    }

    const normalizedBilsoftKod = normalizeSkuForComparison(bilsoftKod);

    // 1. Önce birebir eşleşmeyi bul
    const exactMatch = ideasoftProducts.find(
      (p) => p.sku && normalizeSkuForComparison(p.sku) === normalizedBilsoftKod
    );

    if (exactMatch) {
      console.log(`[StokMatch] Birebir eşleşme bulundu: ${bilsoftKod} → ${exactMatch.id} (${exactMatch.name})`);
      return {
        found: true,
        isExactMatch: true,
        ideasoftId: exactMatch.id,
        ideasoftName: exactMatch.name,
        ideasoftSku: exactMatch.sku,
        similarityScore: 1,
        message: `Birebir eşleşme bulundu: ${exactMatch.name}`,
      };
    }

    // 2. Birebir eşleşme yoksa yakın eşleşme (fuzzy match) bul
    let bestMatch = null;
    let bestScore = 0;

    for (const product of ideasoftProducts) {
      if (!product.sku) continue;
      
      const similarity = calculateEnhancedSimilarity(bilsoftKod, product.sku);
      if (similarity.score > bestScore && similarity.score > 0.3) {
        bestScore = similarity.score;
        bestMatch = product;
      }
    }

    if (bestMatch) {
      console.log(`[StokMatch] Yakın eşleşme bulundu: ${bilsoftKod} → ${bestMatch.id} (${bestMatch.name}), Skor: ${bestScore}`);
      return {
        found: true,
        isExactMatch: false,
        ideasoftId: bestMatch.id,
        ideasoftName: bestMatch.name,
        ideasoftSku: bestMatch.sku,
        similarityScore: bestScore,
        message: `Yakın eşleşme önerisi (Benzerlik: %${Math.round(bestScore * 100)}): ${bestMatch.name}`,
      };
    }

    console.log(`[StokMatch] Eşleşme bulunamadı: ${bilsoftKod}`);
    return {
      found: false,
      message: `SKU ile eşleşme bulunamadı: ${bilsoftKod}`,
    };
  } catch (error) {
    console.error('[StokMatch] Hata:', error);
    return {
      found: false,
      message: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
    };
  }
}

// ============================================================================
// TEKLİ SİNKRONİZASYON (SINGLE SYNC)
// ============================================================================

/**
 * Tek ürün senkronizasyonu: Önizleme verisi döner
 */
export async function previewSingleSync(
  bilsoftKod: string,
  ideasoftId: number,
  havaleIndirimi: number
): Promise<SingleSyncPreview> {
  try {
    console.log(`[SingleSync] Önizleme başlatıldı: ${bilsoftKod} → ${ideasoftId}`);

    // 1. Bilsoft stok kartını çek
    const { data: bilsoftStoks } = await getBilsoftStokKartlari(bilsoftKod, 1, 10);
    const bilsoft = bilsoftStoks?.find((s) => s.kod === bilsoftKod);

    if (!bilsoft) {
      return {
        success: false,
        message: `Bilsoft stok kartı bulunamadı: ${bilsoftKod}`,
      };
    }

    // 2. Ideasoft ürününü çek
    const ideasoftProducts = await getIdeasoftAllProducts(100);
    const ideasoft = ideasoftProducts.find((p) => p.id === ideasoftId);

    if (!ideasoft) {
      return {
        success: false,
        message: `Ideasoft ürünü bulunamadı: ${ideasoftId}`,
      };
    }

    // 3. Hesapla
    const bilsoftSFiyat = bilsoft.sFiyat ? parseFloat(String(bilsoft.sFiyat)) : 0;
    const bilsoftStokOzelKod1 = bilsoft.stokOzelKod1 ? parseFloat(String(bilsoft.stokOzelKod1)) : 0;
    const bilsoftStokOzelKod2 = bilsoft.stokOzelKod2 ? parseFloat(String(bilsoft.stokOzelKod2)) : 0;
    const bilsoftBakiye = bilsoft.bakiye ? parseFloat(String(bilsoft.bakiye)) : 0;

    const commissionFactor = 1 - havaleIndirimi / 100;

    const price1 = bilsoftStokOzelKod1 > 0 ? bilsoftStokOzelKod1 / commissionFactor : 0;
    const price2 = bilsoftSFiyat > 0 ? bilsoftSFiyat / commissionFactor : 0;
    const price3 = bilsoftStokOzelKod2 > 0 ? bilsoftStokOzelKod2 / commissionFactor : 0;

    return {
      success: true,
      message: 'Önizleme başarılı',
      bilsoftData: {
        kod: bilsoft.kod,
        ad: bilsoft.ad,
        sFiyat: bilsoftSFiyat,
        stokOzelKod1: bilsoftStokOzelKod1,
        stokOzelKod2: bilsoftStokOzelKod2,
        bakiye: bilsoftBakiye,
      },
      ideasoftData: {
        id: ideasoft.id,
        sku: ideasoft.sku,
        name: ideasoft.name,
        price1: ideasoft.price1,
        price2: ideasoft.price2,
        price3: ideasoft.price3,
        stockAmount: ideasoft.stockAmount,
      },
      calculatedValues: {
        price1,
        price2,
        price3,
        stockAmount: bilsoftBakiye,
        moneyOrderDiscount: havaleIndirimi,
      },
      commissionCalculation: {
        commissionFactor,
        basePrice1: bilsoftStokOzelKod1,
        basePrice2: bilsoftSFiyat,
        basePrice3: bilsoftStokOzelKod2,
      },
    };
  } catch (error) {
    console.error('[SingleSync] Hata:', error);
    return {
      success: false,
      message: `Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
    };
  }
}

/**
 * Tek ürün senkronizasyonu: Güncelle
 */
export async function executeSingleSync(
  bilsoftKod: string,
  ideasoftId: number,
  havaleIndirimi: number
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    totalBilsoftItems: 1,
    totalIdeasoftItems: 1,
    matchedCount: 1,
    updatedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
  };

  try {
    console.log(`[SingleSync] Senkronizasyon başlatıldı: ${bilsoftKod} → ${ideasoftId}`);

    // 1. Bilsoft stok kartını çek
    const { data: bilsoftStoks } = await getBilsoftStokKartlari(bilsoftKod, 1, 10);
    const bilsoft = bilsoftStoks?.find((s) => s.kod === bilsoftKod);

    if (!bilsoft) {
      result.message = `Bilsoft stok kartı bulunamadı: ${bilsoftKod}`;
      result.errorCount = 1;
      result.errors.push({
        sku: bilsoftKod,
        error: 'Bilsoft stok kartı bulunamadı',
      });
      return result;
    }

    // 2. Hesapla
    const bilsoftSFiyat = bilsoft.sFiyat ? parseFloat(String(bilsoft.sFiyat)) : 0;
    const bilsoftStokOzelKod1 = bilsoft.stokOzelKod1 ? parseFloat(String(bilsoft.stokOzelKod1)) : 0;
    const bilsoftStokOzelKod2 = bilsoft.stokOzelKod2 ? parseFloat(String(bilsoft.stokOzelKod2)) : 0;
    const bilsoftBakiye = bilsoft.bakiye ? parseFloat(String(bilsoft.bakiye)) : 0;

    const commissionFactor = 1 - havaleIndirimi / 100;

    const price1 = bilsoftStokOzelKod1 > 0 ? bilsoftStokOzelKod1 / commissionFactor : 0;
    const price2 = bilsoftSFiyat > 0 ? bilsoftSFiyat / commissionFactor : 0;
    const price3 = bilsoftStokOzelKod2 > 0 ? bilsoftStokOzelKod2 / commissionFactor : 0;

    // 3. Güncellenecek veri hazırla
    const updateData: any = {
      stockAmount: bilsoftBakiye,
      moneyOrderDiscount: havaleIndirimi,
    };

    if (price1 > 0) updateData.price1 = price1;
    if (price2 > 0) updateData.price2 = price2;
    if (price3 > 0) updateData.price3 = price3;

    // 4. Ideasoft'u güncelle
    const updateResult = await updateIdeasoftProduct(ideasoftId, updateData);
    if (updateResult) {
      result.updatedCount = 1;
      result.success = true;
      result.message = `Senkronizasyon başarılı: ${bilsoftKod}`;
      console.log(`[SingleSync] Güncellendi: ${bilsoftKod}`);
      revalidatePath('/stoklar');
    } else {
      result.errorCount = 1;
      result.errors.push({
        sku: bilsoftKod,
        error: 'Ideasoft güncellemesi başarısız',
      });
      result.message = `Senkronizasyon başarısız: ${bilsoftKod}`;
      console.error(`[SingleSync] Güncelleme başarısız: ${bilsoftKod}`);
    }

    return result;
  } catch (error) {
    console.error('[SingleSync] Hata:', error);
    result.errorCount = 1;
    result.errors.push({
      sku: bilsoftKod,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    });
    result.message = `Senkronizasyon hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
    return result;
  }
}
