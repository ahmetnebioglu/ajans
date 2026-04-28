import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses } from '@ajans/google-api';
import { unsecured_prisma as db } from '@ajans/db';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, location } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: 'Sektör/Anahtar kelime (query) zorunludur.' }, { status: 400 });
    }

    console.log(`[SCRAPE] Başlatılıyor: Query="${query}", Location="${location || 'Belirtilmedi'}"`);

    // Google API'den verileri çek
    const businesses = await searchBusinesses(query, location || undefined);
    
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
        // Telefon veya İsim+Şirket bazlı kontrol
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

          // 1. Temel Kayıt Etkileşimi
          interactionData.push({
            type: 'CREATED',
            scoreAdded: 0,
            description: 'Sisteme eklendi (Google Places)'
          });

          // 2. Telefon Puanı
          if (biz.phone) {
            calculatedScore += 10;
            interactionData.push({
              type: 'PROFILE_PHONE',
              scoreAdded: 10,
              description: 'Telefon numarası bulundu (+10 Puan)'
            });
          }

          // 3. Web Sitesi Puanı
          if (biz.website) {
            calculatedScore += 5;
            interactionData.push({
              type: 'PROFILE_WEB',
              scoreAdded: 5,
              description: 'Web sitesi bulundu (+5 Puan)'
            });
          }

          const newLead = await db.lead.create({
            data: {
              name: biz.name || "Bilinmeyen Yetkili",
              companyName: biz.companyName,
              phone: biz.phone,
              website: biz.website,
              source: 'GOOGLE_PLACES',
              status: 'NEW',
              score: calculatedScore,
              tenantId: 'teknikel',
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

    // Cache'i patlat
    revalidatePath('/leads');
    revalidatePath('/vip');

    return NextResponse.json({ 
      success: true, 
      count: savedCount, 
      found: businesses.length,
      message: `${savedCount} yeni işletme başarıyla sisteme aktarıldı.`
    });

  } catch (error: any) {
    console.error('--------------------------------------------------');
    console.error('[SCRAPE FATAL ERROR]:', error.message);
    if (error.stack) console.error(error.stack);
    console.error('--------------------------------------------------');
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Bilinmeyen bir hata oluştu.' 
    }, { status: 500 });
  }
}
