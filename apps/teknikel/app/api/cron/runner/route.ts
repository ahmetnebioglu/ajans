import { NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';
import { getValidToken } from '@/src/services/tokenManager';
import { getBilsoftCariler, getBilsoftLatestInvoiceForCari } from '@/src/services/bilsoft';

/**
 * Vercel Cron: Tüm periyodik işlemleri (token yenileme, veritabanı eşitleme vs.) tek bir uç noktadan çalıştırır.
 * Vercel Hobby planındaki limitasyonları aşmak için tüm job'lar burada birleştirilmiştir.
 */
export async function GET(request: Request) {
  // 1. Yetkilendirme Kontrolü (Vercel Cron Güvenliği)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('[Cron Runner] Tüm işlemler başlatıldı...');
  
  const results: Record<string, any> = {
    tokens: { processed: 0, success: [], errors: [] },
    carilerSync: { processed: 0, updated: 0, error: null }
  };

  // -------------------------------------------------------------
  // JOB 1: API Tokenlarını Yenile
  // -------------------------------------------------------------
  try {
    const tokens = await db.apiToken.findMany();
    for (const token of tokens) {
      results.tokens.processed++;
      try {
        await getValidToken(token.provider);
        results.tokens.success.push(token.provider);
      } catch (err: any) {
        console.error(`[Cron Runner] ${token.provider} yenileme hatası:`, err.message);
        results.tokens.errors.push({ provider: token.provider, error: err.message });
      }
    }
  } catch (error: any) {
    console.error('[Cron Runner] Token job hatası:', error);
    results.tokens.error = error.message;
  }

  // -------------------------------------------------------------
  // JOB 2: Bilsoft Carilerini Eşitle & Son Faturalarını Güncelle
  // -------------------------------------------------------------
  try {
    const { data: allCariler } = await getBilsoftCariler("", 1, 100000);

    if (allCariler && allCariler.length > 0) {
      // Carileri upsert et
      for (const cari of allCariler) {
        await db.bilsoftCariCache.upsert({
          where: { cariId: cari.id },
          update: {
            cariKod: cari.cariKod,
            faturaUnvan: cari.faturaUnvan,
            yetkili: cari.yetkili,
            cep: cari.cep,
            tel: cari.tel,
            mail: cari.mail,
            grup: cari.grup,
          },
          create: {
            cariId: cari.id,
            cariKod: cari.cariKod,
            faturaUnvan: cari.faturaUnvan,
            yetkili: cari.yetkili,
            cep: cari.cep,
            tel: cari.tel,
            mail: cari.mail,
            grup: cari.grup,
            lastCheckedAt: new Date(0), 
          }
        });
      }
      
      results.carilerSync.processed = allCariler.length;

      // Son kontrolü üzerinden en çok zaman geçen 50 cariyi al
      const carisToCheck = await db.bilsoftCariCache.findMany({
        orderBy: { lastCheckedAt: 'asc' },
        take: 50,
      });

      // Fatura tarihlerini güncelle
      for (const cari of carisToCheck) {
        const originalCari = allCariler.find(c => c.cariKod === cari.cariKod);
        if (originalCari && originalCari.id) {
          const lastInvoiceDate = await getBilsoftLatestInvoiceForCari(originalCari.id);
          await db.bilsoftCariCache.update({
            where: { id: cari.id },
            data: {
              lastInvoiceDate: lastInvoiceDate ? new Date(lastInvoiceDate) : null,
              lastCheckedAt: new Date(),
            }
          });
          results.carilerSync.updated++;
        } else {
          await db.bilsoftCariCache.update({
            where: { id: cari.id },
            data: { lastCheckedAt: new Date() }
          });
        }
      }
    }
  } catch (error: any) {
    console.error('[Cron Runner] Cari senkronizasyon hatası:', error);
    results.carilerSync.error = error.message;
  }

  // -------------------------------------------------------------
  // SONUÇ 
  // -------------------------------------------------------------
  console.log('[Cron Runner] İşlemler tamamlandı.');
  return NextResponse.json({
    status: 'completed',
    timestamp: new Date().toISOString(),
    results
  });
}
