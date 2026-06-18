import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses } from '@ajans/google-api';
import { getServicePrisma } from '@ajans/db';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // 1. Servis Token Doğrulaması (Secure by Design)
    const serviceToken = req.headers.get('X-Service-Token') || req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!serviceToken) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Servis tokenı eksik.' }, { status: 401 });
    }

    // İzole veritabanı nesnesini al (Botun tenantId'sine otomatik kilitlenir)
    const db = await getServicePrisma(serviceToken);

    const body = await req.json();
    const { query, location } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: 'Sektör/Anahtar kelime (query) zorunludur.' }, { status: 400 });
    }

    console.log(`[SCRAPE] Başlatılıyor: Query="${query}", Location="${location || 'Belirtilmedi'}"`);

    // Google API'den verileri çek
    const businesses = await searchBusinesses(query, location || undefined, "teknikel");
    
    if (businesses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        found: 0, 
        message: 'Google üzerinde kriterlere uygun yeni bir işletme bulunamadı.' 
      });
    }

    let savedCount = 0;

    // Veritabanına kaydet
    for (const biz of businesses) {
      try {
        // Telefon veya İsim+Şirket bazlı kontrol (Artık botun kendi tenantId'si içinde aranır)
        const existing = await db.lead.findFirst({
          where: {
            OR: [
              biz.phone ? { phone: biz.phone } : undefined,
              { 
                companyName: biz.companyName,
                name: biz.name 
              }
            ].filter(Boolean) as any
          }
        });

        if (!existing) {
          // SKOR ALGORİTMASI: Taban 0, Telefon +10, Web +5
          let calculatedScore = 0;
          const interactionData = [];

          interactionData.push({
            type: 'CREATED',
            scoreAdded: 0,
            description: 'Sisteme eklendi (Google Places)'
          });

          if (biz.phone) {
            calculatedScore += 10;
            interactionData.push({
              type: 'PROFILE_PHONE',
              scoreAdded: 10,
              description: 'Telefon numarası bulundu (+10 Puan)'
            });
          }

          if (biz.website) {
            calculatedScore += 5;
            interactionData.push({
              type: 'PROFILE_WEB',
              scoreAdded: 5,
              description: 'Web sitesi bulundu (+5 Puan)'
            });
          }

          await db.lead.create({
            data: {
              name: biz.name || "Bilinmeyen Yetkili",
              companyName: biz.companyName,
              phone: biz.phone,
              website: biz.website,
              source: 'GOOGLE_PLACES',
              status: 'PROSPECT',
              score: calculatedScore,
              // tenantId artık getServicePrisma tarafından veritabanı seviyesinde (RLS) hallediliyor
              interactions: {
                create: interactionData
              }
            }
          });

          savedCount++;
        }
      } catch (dbError) {
        console.error(`[DB ERROR] ${biz.companyName} kaydedilirken hata oluştu:`, dbError);
      }
    }

    revalidatePath('/leads');
    revalidatePath('/vip');

    return NextResponse.json({ 
      success: true, 
      count: savedCount, 
      found: businesses.length,
      message: `${savedCount} yeni işletme başarıyla sisteme aktarıldı.`
    });

  } catch (error: any) {
    console.error('[SCRAPE FATAL ERROR]:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Bilinmeyen bir hata oluştu.' 
    }, { status: error.message.includes('Yetkisiz') ? 401 : 500 });
  }
}
