import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getIdeasoftOrderById } from '@/src/services/ideasoft';
import {
  getBilsoftStokById,
  createBilsoftFatura,
  getBilsoftStockCardDetail,
  fetchAndCacheBilsoftStocks,
} from '@/src/services/bilsoft';
import { NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Ideasoft siparişinden Bilsoft faturası oluşturur.
 * Normal ödeme yöntemleri (Havale, EFT, Nakit vb.) için kullanılır.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { orderId, selectedCari } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Ideasoft'tan sipariş detayını çek
    const order = await getIdeasoftOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Cari bilgisini belirle
    const normalizedGroupName = order.memberGroupName?.toLocaleLowerCase('tr-TR').trim() || '';
    const isService = normalizedGroupName === 'servis';

    let cariInfo: any;
    if (selectedCari) {
      cariInfo = {
        cariId: selectedCari.id,
        unvan: selectedCari.faturaUnvan || selectedCari.yetkili || 'Bilinmeyen',
        yetkili: selectedCari.yetkili || selectedCari.faturaUnvan || 'Bilinmeyen',
        grup: selectedCari.grup || 'MÜŞTERİ',
        kullaniciAdi: selectedCari.kullaniciAdi || 'teknikel',
        vergiDairesi: selectedCari.vergiDairesi || selectedCari.vd || '',
        vergiNo: selectedCari.vergiNo || selectedCari.vn || '',
      };
    } else {
      // Otomatik cari seçimi
      cariInfo = selectCariByMemberGroup(order.memberGroupName);
    }

    // Stok kartlarını önbellekle (user isteği üzerine)
    await fetchAndCacheBilsoftStocks(true);

    // Sipariş kalemlerini fatura kalemleri formatına çevir
    const faturaKalemleri = await prepareFaturaItems(order.orderItems || [], cariInfo, order);

    // Fatura tutarlarını hesapla
    const tutarlar = calculateInvoiceTotals(order, faturaKalemleri, cariInfo);

    // Fatura request body'sini oluştur
    const invoiceData = buildInvoiceRequestBody(order, cariInfo, faturaKalemleri, tutarlar);

    console.log(`[invoice] Bilsoft Fatura oluşturuluyor: ${order.id} - ${cariInfo.unvan}`);

    // Bilsoft'a fatura gönder
    const result = await createBilsoftFatura(invoiceData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Fatura oluşturulamadı',
        },
        { status: 400 }
      );
    }

    // Fatura başarıyla oluşturulduysa, detayını çek ve eğer detayda fatIsl yoksa FatIsl/addrange ile ekle
    let detailedInvoice = null;
    if (result.data?.id) {
      const invoiceId = result.data.id;

      try {
        const detailResponse = await axios.get(
          `https://apiv3.bilsoft.com/api/Fatura/getbyid?id=${invoiceId}`,
          {
            headers: {
              Authorization: `Bearer ${(session as any).bilsoftToken || ''}`,
              'Content-Type': 'application/json',
            },
          }
        );
        detailedInvoice = detailResponse.data?.data;
      } catch (e) {
        console.warn('[invoice] İlk detay çekilemedi (normal bir durum):', (e as any).message);
      }

      const needToAddItems =
        faturaKalemleri &&
        faturaKalemleri.length > 0 &&
        (!detailedInvoice?.fatIsl || detailedInvoice.fatIsl.length === 0);

      if (needToAddItems) {
        const itemsWithFatId = faturaKalemleri
          .map((item) => ({
            ...item,
            fatId: invoiceId,
            depoId: item.depoId ?? 1,
          }))
          .filter((item) => item.stokId !== null && item.stokId !== undefined);

        if (itemsWithFatId.length > 0) {
          try {
            await axios.post(
              'https://apiv3.bilsoft.com/api/FatIsl/addrange',
              itemsWithFatId,
              {
                headers: {
                  Authorization: `Bearer ${(session as any).bilsoftToken || ''}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          } catch (itemsError) {
            console.error('[invoice] Error adding FatIsl:', (itemsError as any).message);
          }
        }

        // Polling - Fatura kalemlerinin Bilsoft'a düşmesini bekle
        try {
          const maxAttempts = 3;
          let attempt = 0;
          while (attempt < maxAttempts) {
            const pollResponse = await axios.get(
              `https://apiv3.bilsoft.com/api/Fatura/getbyid?id=${invoiceId}`,
              {
                headers: {
                  Authorization: `Bearer ${(session as any).bilsoftToken || ''}`,
                },
              }
            );
            detailedInvoice = pollResponse.data?.data;
            if (detailedInvoice?.fatIsl && detailedInvoice.fatIsl.length > 0) {
              break;
            }
            attempt++;
            if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (pollErr) {
          // Polling hatası
        }
      }
    }

    // Stok kartı bulunamayan ürünleri tespit et
    const missingStockItems = faturaKalemleri.filter((item) => item.stokId === null);

    return NextResponse.json({
      success: true,
      message: 'Fatura başarıyla oluşturuldu',
      invoice: result.data,
      detailedInvoice: detailedInvoice,
      orderId: orderId,
      warning:
        missingStockItems.length > 0
          ? {
              message: `${missingStockItems.length} ürün için stok kartı bulunamadı. Bu ürünler Bilsoft masaüstünde görünmeyebilir.`,
              missingItems: missingStockItems.map((item) => ({
                sku: item.urunKodu,
                name: item.ad,
              })),
            }
          : null,
    });
  } catch (error) {
    console.error('[invoice] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Müşteri grubuna göre cari seçer
 */
function selectCariByMemberGroup(memberGroupName: string | undefined) {
  const normalizedGroupName = memberGroupName?.toLocaleLowerCase('tr-TR').trim() || '';
  const isServiceGroup = normalizedGroupName === 'servis';

  if (isServiceGroup) {
    return {
      cariId: 11,
      unvan: 'GENEL MÜŞTERİ',
      yetkili: 'GENEL MÜŞTERİ',
      grup: 'SERVİS',
      kullaniciAdi: 'teknikel',
    };
  } else {
    return {
      cariId: 62,
      unvan: 'PERAKENDE',
      yetkili: 'PERAKENDE',
      grup: 'MÜŞTERİ',
      kullaniciAdi: 'teknikel2',
    };
  }
}

/**
 * Sipariş kalemlerini fatura kalemleri formatına çevirir
 */
async function prepareFaturaItems(items: any[], cariInfo: any, order: any) {
  const faturaKalemleri: any[] = [];

  for (const item of items) {
    try {
      const birimFiyat =
        item.productPrice -
        (item.productDiscount || 0) -
        (item.productMoneyOrderDiscount || 0);

      let stokId = null;
      let maliyet = 0;
      let kdvOran = 20;
      let stokRafi = '';
      let resimYolu = '';
      let ozelKod1 = '';
      let ozelKod2 = '';
      let ozelKod3 = '';
      let ozelKod4 = '';
      let birim = 'Adet';

      // Stok kartı bilgilerini almayı dene
      try {
        const stockCardResult = await getBilsoftStockCardDetail({
          stokKodu: item.productSku,
          forceRefresh: false,
        });

        if (stockCardResult.success && stockCardResult.data) {
          const stockCard = stockCardResult.data;
          stokId = stockCard.id;
          maliyet = stockCard.aFiyat || 0;
          const kdvOranStr = stockCard.kdvOran || '20';
          kdvOran = parseFloat(kdvOranStr);
          stokRafi = stockCard.stokRafi || '';
          resimYolu = stockCard.resimYolu || '';
          ozelKod1 = stockCard.stokOzelKod1 || '';
          ozelKod2 = stockCard.stokOzelKod2 || '';
          ozelKod3 = stockCard.stokOzelKod3 || '';
          ozelKod4 = stockCard.stokOzelKod4 || '';
          birim = stockCard.birim || 'Adet';
        }
      } catch (stockError) {
        // Stok kartı sorgulaması hatası
      }

      const qty = parseFloat(item.productQuantity || 0);
      const unitExcl = parseFloat(
        (
          item.productPrice -
          (item.productDiscount || 0) -
          (item.productMoneyOrderDiscount || 0)
        ).toFixed(4)
      );
      const lineExcl = parseFloat((unitExcl * qty).toFixed(2));
      const kdvTutarLine = parseFloat(((lineExcl * kdvOran) / 100).toFixed(2));
      const lineIncl = parseFloat((lineExcl + kdvTutarLine).toFixed(2));

      faturaKalemleri.push({
        urunKodu: item.productSku,
        barkod: item.productSku,
        ad: item.productName,
        miktar: qty,
        brfiyat: unitExcl,
        topfiyat: lineExcl,
        gtopfiyat: lineIncl,
        kdvTutar: kdvTutarLine,
        kdvOran: kdvOran,
        stokId: stokId,
        maliyet: maliyet,
        iskontoOran: 0,
        iskontoTutar: 0,
        birim: birim,
        kullaniciAdi: cariInfo.kullaniciAdi,
        subeAdi: 'Merkez',
        depoId: null,
        otvOran: 0.0,
        otvTutar: 0.0,
        otvKodu: '0',
        otvAdi: 'Ötv Seçiniz',
        tevkifatOran: 0.0,
        tevkifatKodu: '0',
        tevkifatAdi: 'Tevkifat Seçiniz',
        tevkifatTutar: 0.0,
        kdvMuafiyetAdi: 'Kdv Muafiyet Seçiniz',
        kdvMuafiyetKodu: '0',
        kdvDahil: 'Kdv Haric',
        otvDahil: 'Ötv Haric',
        kdvDurum: null,
        stokRafi: stokRafi,
        resimYolu: resimYolu,
        lotId: 0,
        stokOzelKod1: ozelKod1,
        stokOzelKod2: ozelKod2,
        stokOzelKod3: ozelKod3,
        stokOzelKod4: ozelKod4,
      });
    } catch (error) {
      console.error(`[invoice] Ürün işleme hatası (${item.productSku}):`, error);
    }
  }

  // Deduplicate items
  try {
    const map = new Map();
    for (const it of faturaKalemleri) {
      const stokIdVal = parseInt(it.stokId) || null;
      const brf = parseFloat(it.brfiyat || 0).toFixed(2);
      const kdvOr = (it.kdvOran != null ? String(it.kdvOran) : '').toLowerCase();
      const key =
        stokIdVal && stokIdVal > 0
          ? `id:${stokIdVal}`
          : `sku:${(it.urunKodu || '').toLowerCase()}|p:${brf}|k:${kdvOr}`;

      const qty = parseFloat(it.miktar || 0);
      const top = parseFloat(it.topfiyat || 0);
      const gtop = parseFloat(it.gtopfiyat || 0);
      const kdv = parseFloat(it.kdvTutar || 0);
      const isk = parseFloat(it.iskontoTutar || 0);
      const maliyet = parseFloat(it.maliyet || 0);

      if (!map.has(key)) {
        const copy = { ...it };
        copy.miktar = qty;
        copy.topfiyat = top;
        copy.gtopfiyat = gtop;
        copy.kdvTutar = kdv;
        copy.iskontoTutar = isk;
        copy._qty = qty;
        copy._totalMaliyet = maliyet * qty;
        map.set(key, copy);
      } else {
        const prev = map.get(key);
        prev.miktar = parseFloat(prev.miktar || 0) + qty;
        prev.topfiyat = parseFloat(prev.topfiyat || 0) + top;
        prev.gtopfiyat = parseFloat(prev.gtopfiyat || 0) + gtop;
        prev.kdvTutar = parseFloat(prev.kdvTutar || 0) + kdv;
        prev.iskontoTutar = parseFloat(prev.iskontoTutar || 0) + isk;
        prev._qty = (prev._qty || 0) + qty;
        prev._totalMaliyet = (prev._totalMaliyet || 0) + maliyet * qty;
        prev.maliyet =
          prev._qty > 0
            ? parseFloat((prev._totalMaliyet / prev._qty).toFixed(2))
            : prev.maliyet;
      }
    }

    faturaKalemleri.length = 0;
    for (const v of map.values()) {
      delete v._qty;
      delete v._totalMaliyet;
      faturaKalemleri.push(v);
    }
  } catch (dedupeErr) {
    console.warn('[invoice] Dedupe hatası:', (dedupeErr as any).message);
  }

  // Kargo satırı ekle
  try {
    const shippingAmount = parseFloat(order.shippingAmount || 0);
    if (shippingAmount > 0) {
      try {
        const shipResp = await axios.get(
          'https://apiv3.bilsoft.com/api/Stok/getbyid?id=1800',
          {
            headers: {
              Authorization: `Bearer ${(session as any)?.user?.bilsoftToken || ''}`,
            },
          }
        );

        if (shipResp.data?.success && shipResp.data.data) {
          const shipCard = shipResp.data.data;
          const kdvRate = parseFloat(shipCard.kdvOran || '0');
          const qty_ship = 1;
          const lineIncl = parseFloat(shippingAmount.toFixed(2));
          const lineExcl = parseFloat((lineIncl / (1 + kdvRate / 100)).toFixed(2));
          const kdvTutar = parseFloat((lineIncl - lineExcl).toFixed(2));
          const unitExcl = parseFloat((lineExcl / qty_ship).toFixed(4));

          faturaKalemleri.push({
            urunKodu: shipCard.kod || 'KARGO',
            barkod: shipCard.barkod || shipCard.kod || 'KARGO',
            ad: shipCard.ad || 'KARGO',
            miktar: qty_ship,
            brfiyat: unitExcl,
            topfiyat: lineExcl,
            gtopfiyat: lineIncl,
            kdvTutar: kdvTutar,
            kdvOran: kdvRate || 0,
            stokId: shipCard.id,
            maliyet: shipCard.aFiyat || 0,
            iskontoOran: 0,
            iskontoTutar: 0,
            birim: shipCard.birim || 'Adet',
            kullaniciAdi: cariInfo.kullaniciAdi,
            subeAdi: shipCard.subeAdi || 'Merkez',
            depoId: null,
            otvOran: 0,
            otvTutar: 0,
            otvKodu: '0',
            otvAdi: 'Ötv Seçiniz',
            tevkifatOran: 0.0,
            tevkifatKodu: '0',
            tevkifatAdi: 'Tevkifat Seçiniz',
            tevkifatTutar: 0.0,
            kdvMuafiyetAdi: 'Kdv Muafiyet Seçiniz',
            kdvMuafiyetKodu: '0',
            kdvDahil: 'Kdv Haric',
            otvDahil: shipCard.otvDahil || 'Ötv Haric',
            kdvDurum: null,
            stokRafi: shipCard.stokRafi || '',
            resimYolu: shipCard.resimYolu || '',
            lotId: 0,
            stokOzelKod1: shipCard.stokOzelKod1 || '',
            stokOzelKod2: shipCard.stokOzelKod2 || '',
            stokOzelKod3: shipCard.stokOzelKod3 || '',
            stokOzelKod4: shipCard.stokOzelKod4 || '',
          });
        }
      } catch (kargoErr) {
        console.warn('[invoice] Kargo stok kartı hatası:', (kargoErr as any).message);
      }
    }
  } catch (err) {
    console.warn('[invoice] Kargo kalemi eklenirken hata:', (err as any).message);
  }

  // Taksit komisyonu ekle
  try {
    const installment = parseInt(order?.installment || 0);
    const generalAmount = parseFloat(order?.generalAmount || 0);
    const finalAmount = parseFloat(order?.finalAmount || 0);
    const installmentCommission = finalAmount - generalAmount;

    if (installment > 1 && installmentCommission > 0) {
      try {
        const commissionResp = await axios.get(
          'https://apiv3.bilsoft.com/api/Stok/getbyid?id=2421',
          {
            headers: {
              Authorization: `Bearer ${(session as any)?.user?.bilsoftToken || ''}`,
            },
          }
        );

        if (commissionResp.data?.success && commissionResp.data.data) {
          const commissionCard = commissionResp.data.data;
          const kdvRate = parseFloat(commissionCard.kdvOran || '0');
          const qty_commission = 1;
          const lineIncl = parseFloat(installmentCommission.toFixed(2));
          const lineExcl = parseFloat((lineIncl / (1 + kdvRate / 100)).toFixed(2));
          const kdvTutar = parseFloat((lineIncl - lineExcl).toFixed(2));
          const unitExcl = parseFloat((lineExcl / qty_commission).toFixed(4));

          faturaKalemleri.push({
            urunKodu: commissionCard.kod || 'BANKA_KOMISYON',
            barkod: commissionCard.barkod || commissionCard.kod || 'BANKA_KOMISYON',
            ad: commissionCard.ad || 'Banka Komisyonu',
            miktar: qty_commission,
            brfiyat: unitExcl,
            topfiyat: lineExcl,
            gtopfiyat: lineIncl,
            kdvTutar: kdvTutar,
            kdvOran: kdvRate || 0,
            stokId: commissionCard.id,
            maliyet: commissionCard.aFiyat || 0,
            iskontoOran: 0,
            iskontoTutar: 0,
            birim: commissionCard.birim || 'Adet',
            kullaniciAdi: cariInfo.kullaniciAdi,
            subeAdi: commissionCard.subeAdi || 'Merkez',
            depoId: null,
            otvOran: 0,
            otvTutar: 0,
            otvKodu: '0',
            otvAdi: 'Ötv Seçiniz',
            tevkifatOran: 0.0,
            tevkifatKodu: '0',
            tevkifatAdi: 'Tevkifat Seçiniz',
            tevkifatTutar: 0.0,
            kdvMuafiyetAdi: 'Kdv Muafiyet Seçiniz',
            kdvMuafiyetKodu: '0',
            kdvDahil: 'Kdv Haric',
            otvDahil: commissionCard.otvDahil || 'Ötv Haric',
            kdvDurum: null,
            stokRafi: commissionCard.stokRafi || '',
            resimYolu: commissionCard.resimYolu || '',
            lotId: 0,
            stokOzelKod1: commissionCard.stokOzelKod1 || '',
            stokOzelKod2: commissionCard.stokOzelKod2 || '',
            stokOzelKod3: commissionCard.stokOzelKod3 || '',
            stokOzelKod4: commissionCard.stokOzelKod4 || '',
          });
        }
      } catch (commissionErr) {
        console.warn('[invoice] Taksit komisyonu hatası:', (commissionErr as any).message);
      }
    }
  } catch (err) {
    console.warn('[invoice] Taksit komisyonu eklenirken hata:', (err as any).message);
  }

  // Kargo ve komisyon kalemlerini sona taşı
  try {
    const isKargo = (it: any) =>
      String(it.ad || '').toLowerCase().includes('kargo') ||
      String(it.urunKodu || '').toLowerCase().includes('kargo');

    const isCommission = (it: any) =>
      String(it.ad || '').toLowerCase().includes('komisyon') ||
      String(it.urunKodu || '').toLowerCase().includes('komisyon');

    const kargoItems = faturaKalemleri.filter(isKargo);
    const commissionItems = faturaKalemleri.filter(isCommission);
    const otherItems = faturaKalemleri.filter((it) => !isKargo(it) && !isCommission(it));

    return [...otherItems, ...kargoItems, ...commissionItems];
  } catch (reorderErr) {
    console.warn('[invoice] Yeniden sıralama hatası:', (reorderErr as any).message);
    return faturaKalemleri;
  }
}

/**
 * Fatura tutarlarını hesapla
 */
function calculateInvoiceTotals(order: any, faturaKalemleri: any[] = [], cariInfo: any = {}) {
  const getVal = (val: any) => {
    const p = parseFloat(val);
    return isNaN(p) ? 0 : p;
  };

  const gtoplam = parseFloat(getVal(order.finalAmount || order.orderTotal).toFixed(2));
  const kdv = parseFloat(getVal(order.taxAmount).toFixed(2));
  const toplam = parseFloat((gtoplam - kdv).toFixed(2));
  const iskonto = parseFloat(
    (
      getVal(order.couponDiscount) +
      getVal(order.promotionDiscount) +
      getVal(order.campaignDiscount) +
      getVal(order.orderDiscount)
    ).toFixed(2)
  );

  return {
    toplam,
    kdv,
    gtoplam,
    iskonto,
    yazi: numberToWords(gtoplam),
  };
}

/**
 * Sayıyı yazıya çevirir (Türkçe)
 */
function numberToWords(amount: number): string {
  const birler = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const onlar = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];

  const tl = Math.floor(amount);
  const krs = Math.round((amount - tl) * 100);

  let tlText = '';
  let krsText = '';

  if (tl === 0) {
    tlText = 'Sıfır';
  } else if (tl < 10) {
    tlText = birler[tl];
  } else if (tl < 100) {
    const onlarBasamak = Math.floor(tl / 10);
    const birlerBasamak = tl % 10;
    tlText = onlar[onlarBasamak] + (birlerBasamak > 0 ? birler[birlerBasamak] : '');
  } else {
    tlText = tl.toString();
  }

  if (krs === 0) {
    krsText = 'Sıfır';
  } else if (krs < 10) {
    krsText = birler[krs];
  } else if (krs < 100) {
    const onlarBasamak = Math.floor(krs / 10);
    const birlerBasamak = krs % 10;
    krsText = onlar[onlarBasamak] + (birlerBasamak > 0 ? birler[birlerBasamak] : '');
  }

  return `${tlText} TL ${krsText} Krş.`;
}

/**
 * Fatura request body'sini oluştur
 */
function buildInvoiceRequestBody(
  order: any,
  cariInfo: any,
  faturaKalemleri: any[],
  tutarlar: any
) {
  const now = new Date();
  const nowUtcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const tz3Millis = nowUtcMillis + 3 * 60 * 60000;
  const tzNow = new Date(tz3Millis);
  const fatTarih = tzNow.toISOString().split('T')[0];

  const invoiceUnvan = cariInfo?.unvan || 'PERAKENDE';

  const customerName = (function () {
    const first = order.customerFirstname || order.billingAddress?.firstname || '';
    const last = order.customerSurname || order.billingAddress?.surname || '';
    const full = `${first} ${last}`.trim();
    return full || invoiceUnvan;
  })();

  const paidStatuses = ['approved', 'being_prepared', 'fulfilled', 'delivered', 'on_accumulation'];
  const isPaid = paidStatuses.includes(order.status);
  const odenenTutar = isPaid ? tutarlar.gtoplam : 0.0;

  const stokIsl: any[] = [];
  faturaKalemleri.forEach((item) => {
    if (item.stokId) {
      stokIsl.push({
        id: 0,
        stokId: item.stokId,
        tur: 'ÇIKIŞ',
        adet: item.miktar,
        tarih: fatTarih,
        aciklama: 'Satış Faturası',
        fatId: 0,
        kullaniciAdi: cariInfo.kullaniciAdi,
        subeAdi: 'Merkez',
        depoId: 1,
        hedefdepoId: null,
        lotId: 0,
      });
    }
  });

  const bankaIsl: any[] = [];
  if (isPaid) {
    bankaIsl.push({
      id: 0,
      BankaId: 1,
      tip: 'GİRİŞ',
      tarih: fatTarih,
      tutar: tutarlar.gtoplam,
      aciklama: 'Havale Satış',
      subeAdi: 'Merkez',
      kullaniciAdi: cariInfo.kullaniciAdi,
      CariId: cariInfo.cariId,
      EvrakNo: '',
      Unvan: invoiceUnvan,
      OdemeSekli: 'Nakit',
    });
  }

  return {
    id: 0,
    cariId: cariInfo.cariId,
    unvan: invoiceUnvan,
    adres: order.shippingAddress?.address || '',
    vd: cariInfo.vergiDairesi || '',
    vn:
      cariInfo.vergiNo ||
      order.tcKimlikNo ||
      order.customerIdentityNumber ||
      order.identityNumber ||
      order.customerTc ||
      order.billingAddress?.identityRegistrationNumber ||
      order.taxNumber ||
      order.billingAddress?.taxNo ||
      '',
    fatTarih: fatTarih,
    sevkTarih: fatTarih,
    vade: fatTarih,
    saat: tzNow.toTimeString().slice(0, 5),
    toplam: tutarlar.toplam,
    kdv: tutarlar.kdv,
    gtoplam: tutarlar.gtoplam,
    yazi: tutarlar.yazi,
    il: order.shippingAddress?.location || '',
    ilce: order.shippingAddress?.subLocation || '',
    odemeSekli: 'Nakit',
    faturaTuru: 'SATIŞ FATURASI',
    yetkili: customerName,
    odenen: odenenTutar,
    evrakNo: '',
    alinan: odenenTutar,
    maliyet: faturaKalemleri.reduce((sum, item) => sum + item.maliyet * parseFloat(item.miktar), 0),
    iskonto: tutarlar.iskonto,
    fisno: '',
    tel: order.customerPhone || '',
    cep: order.customerPhone || '',
    postakodu: '',
    sevkAdresi: order.shippingAddress?.address || '',
    aciklama: `Ideasoft Sipariş No: ${order.id}`,
    kullaniciAdi: cariInfo.kullaniciAdi,
    subeAdi: 'Merkez',
    ticaretsicilno: '-',
    tevkifatOran: 0.0,
    tevkifatTutar: 0.0,
    cariKod: '',
    faturaResimYolu: '',
    otvTutar: 0.0,
    eFaturaNo: '',
    eFaturaSenaryo: 'Normal',
    eFaturaTipi: '',
    eFaturaDurum: '',
    eFaturaSenaryoTipi: '',
    irsaliyeFaturalandi: false,
    cariGrup: cariInfo.grup || '',
    cariMail: order.customerEmail || '',
    ozelAlan1: '',
    ozelAlan2: '',
    stopajOran1: 0.0,
    stopajtutar1: 0.0,
    stopajOran2: 0.0,
    stopajtutar2: 0.0,
    stopajOran3: 0.0,
    stopajtutar3: 0.0,
    stopajOran4: 0.0,
    stopajtutar4: 0.0,
    ulke: 'Türkiye',
    siparisNo: order.id?.toString() || '',
    siparisTarihi: order.createdAt || fatTarih,
    irsaliyeNo: '',
    irsaliyeTarihi: fatTarih,
    dokumanNo: '',
    periyotBaslangic: fatTarih,
    periyotBitis: new Date(tzNow.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    oivTutar: 0.0,
    mukellefKodu: '',
    mukellefAdi: '',
    MalKabulTarih: '',
    digerVergiToplam: 0.0,
    paraBirimi: 'TRY',
    dovizKur: 1.0,
    eIlaveFaturaTipi: '',
    odemeYapacakvkn: '',
    cariIban: '',
    malKabulId: 0,
    fatHammaddeIsl: [],
    faturaTeslimAdres: [],
    fatIsl: [],
    cariKart: [
      {
        id: cariInfo.cariId,
        grup: cariInfo.grup || '',
        yetkili: customerName,
        adres: order.shippingAddress?.address || '',
        mail: order.customerEmail || '',
        faturaIl: order.shippingAddress?.location || '',
        faturaIlce: order.shippingAddress?.subLocation || '',
        faturaAdres: order.shippingAddress?.address || '',
        vergiDairesi: cariInfo.vergiDairesi || '',
        vergiNo:
          cariInfo.vergiNo ||
          order.tcKimlikNo ||
          order.customerIdentityNumber ||
          order.identityNumber ||
          order.customerTc ||
          order.billingAddress?.identityRegistrationNumber ||
          order.taxNumber ||
          order.billingAddress?.taxNo ||
          '',
        faturaUnvan: invoiceUnvan || '',
        riskLimiti: '0',
        riskIslemi: 'yaptır',
        kullaniciAdi: cariInfo.kullaniciAdi || '',
        subeAdi: 'Merkez',
        ticaretsicilno: '',
        cariKod: '',
        varsayilanKasa: 'Varsayılan Kasa',
        varsayilanVadeGunu: 30,
        faturaUlke: 'Türkiye',
        webAdresi: '',
        postakodu: '',
        sevkAdresi: order.shippingAddress?.address || '',
        cariIsl: [
          {
            id: 0,
            cariId: cariInfo.cariId,
            tarih: fatTarih,
            vade: fatTarih,
            odemeSekli: 'Nakit',
            aciklama: `Sipariş No: ${order.id}`,
            borc: tutarlar.gtoplam,
            alacak: isPaid ? tutarlar.gtoplam : 0.0,
            tip: 4,
            taksitId: null,
            taksitIslId: null,
            fatId: null,
            cekId: null,
            bankaIslId: null,
            kasaId: null,
            banka: null,
            evrakNo: '',
            kullaniciAdi: cariInfo.kullaniciAdi,
            subeAdi: 'Merkez',
          },
        ],
      },
    ],
    stokIsl: stokIsl,
    bankaIsl: bankaIsl,
  };
}
