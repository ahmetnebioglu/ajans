import { NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';
import { getValidToken } from '@/src/services/tokenManager';

/**
 * Vercel Cron: Tüm 3. parti tokenlarını periyodik olarak yeniler.
 * Çalışma sıklığı: 30 dakikada bir (vercel.json içinde ayarlı)
 */
export async function GET(request: Request) {
  // 1. Yetkilendirme Kontrolü (Vercel Cron Güvenliği)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log('[Cron] Token yenileme işlemi başlatıldı...');
  
  const results: Record<string, any> = {
    processed: 0,
    success: [],
    errors: []
  };

  try {
    // 2. Veritabanındaki tüm aktif provider'ları tara
    const tokens = await db.apiToken.findMany();
    
    for (const token of tokens) {
      results.processed++;
      try {
        // getValidToken zaten içindeki emniyet ventili ile süresi dolanı yenileyecektir.
        // Ancak cron her durumda kontrol edip gerekiyorsa yenilesin diye çağırıyoruz.
        await getValidToken(token.provider);
        results.success.push(token.provider);
      } catch (err: any) {
        console.error(`[Cron] ${token.provider} yenileme hatası:`, err.message);
        results.errors.push({ provider: token.provider, error: err.message });
      }
    }

    return NextResponse.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      ...results
    });

  } catch (error: any) {
    console.error('[Cron] Kritik hata:', error);
    return NextResponse.json({
      status: 'failed',
      error: error.message
    }, { status: 500 });
  }
}
