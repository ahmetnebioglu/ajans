import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getIdeasoftOrderById } from '@/src/services/ideasoft';
import { getBilsoftStokById, createBilsoftFatura } from '@/src/services/bilsoft';
import { NextResponse } from 'next/server';

/**
 * Ideasoft siparişinden Bilsoft faturası oluşturur.
 * Kredi kartı ödeme yöntemleri için kullanılır.
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
    const cariId = isService ? (selectedCari?.id || 11) : 62; // 11: Genel Müşteri, 62: Perakende

    // Sipariş kalemlerini Bilsoft formatına dönüştür
    const fatIsl = [];
    let sira = 1;

    for (const item of order.orderItems || []) {
      try {
        // Bilsoft'ta stok kartını bul
        const sku = item.sku || item.productCode || '';
        const stok = await getBilsoftStokById(sku);

        if (!stok) {
          console.warn(`[InvoiceCreditCard] Stok kartı bulunamadı: ${sku}`);
          continue; // Stok kartı yoksa atla
        }

        const miktar = item.quantity || 1;
        const birimFiyat = item.price || stok.sFiyat || 0;
        const kdvOran = stok.kdvOran || 0;
        const tutar = miktar * birimFiyat;
        const kdvTutar = (tutar * kdvOran) / 100;
        const topfiyat = tutar + kdvTutar;

        fatIsl.push({
          sira,
          stokKodu: stok.kod,
          stokAdi: stok.ad,
          miktar,
          birim: stok.birim || 'Adet',
          birimFiyat,
          kdvOran,
          tutar,
          kdvTutar,
          topfiyat,
        });

        sira++;
      } catch (itemError) {
        console.error(`[InvoiceCreditCard] Kalem işleme hatası (${item.sku}):`, itemError);
        continue;
      }
    }

    if (fatIsl.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faturaya eklenecek geçerli kalem bulunamadı',
        },
        { status: 400 }
      );
    }

    // Fatura payload'ını oluştur (Kredi kartı ödeme)
    const faturaPayload = {
      cariId,
      fatTarih: new Date().toISOString().split('T')[0],
      odemeSekli: 'KREDİ KARTI',
      faturaTuru: 'SATIS',
      siparisNo: orderId.toString(),
      fatIsl,
    };

    // Bilsoft'a fatura gönder
    const result = await createBilsoftFatura(faturaPayload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Fatura oluşturulamadı',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fatura başarıyla oluşturuldu',
      invoice: result.data,
      detailedInvoice: result.data,
    });
  } catch (error) {
    console.error('[InvoiceCreditCard] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
