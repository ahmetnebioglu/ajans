const axios = require('axios');
require('dotenv').config({ path: 'apps/teknikel/.env.local' });

const { unsecured_prisma: db } = require('@ajans/db');
const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';

async function searchBusinesses(query, location) {
  const fullQuery = location ? `${query} in ${location}` : query;
  
  const response = await axios.post(
    'https://places.googleapis.com/v1/places:searchText',
    {
      textQuery: fullQuery,
      languageCode: 'tr',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.id'
      }
    }
  );

  if (!response.data || !response.data.places) {
    return [];
  }

  return response.data.places.map((place) => ({
    name: place.displayName?.text || 'Bilinmeyen Yetkili',
    companyName: place.displayName?.text || 'Bilinmeyen Firma',
    phone: place.nationalPhoneNumber || null,
    address: place.formattedAddress || 'Adres bilgisi yok',
    website: place.websiteUri || null,
    placeId: place.id
  }));
}

async function testScrape() {
  try {
    console.log('🔍 Scrape test başlıyor...\n');
    
    // Google Places'tan veri çek
    const businesses = await searchBusinesses('Kombi Servisi', 'Kadıköy, İstanbul');
    console.log(`✅ Google Places'tan ${businesses.length} işletme bulundu\n`);
    
    if (businesses.length === 0) {
      console.log('⚠️ Hiç işletme bulunamadı');
      process.exit(0);
    }

    let savedCount = 0;
    let errorCount = 0;
    let firstError = null;

    // Veritabanına kaydet
    for (const biz of businesses.slice(0, 3)) {
      try {
        console.log(`\n📝 Kaydediliyor: ${biz.companyName}`);
        
        // Dedupe kontrol
        const dedupeConditions = [];
        
        if (biz.phone) {
          dedupeConditions.push({ phone: biz.phone });
        }
        
        if (biz.companyName && biz.name) {
          dedupeConditions.push({
            companyName: biz.companyName,
            name: biz.name,
          });
        }

        const existing = dedupeConditions.length > 0 
          ? await db.lead.findFirst({
              where: {
                tenantId: "teknikel",
                OR: dedupeConditions,
              },
            })
          : null;

        if (existing) {
          console.log(`   ⏭️  Zaten var, atlanıyor`);
          continue;
        }

        // Skor hesapla
        let calculatedScore = 0;
        const interactionData = [];

        interactionData.push({
          type: "CREATED",
          scoreAdded: 0,
          description: `Sisteme eklendi (Google Places) — Test script`,
        });

        if (biz.phone) {
          calculatedScore += 10;
          interactionData.push({
            type: "PROFILE_PHONE",
            scoreAdded: 10,
            description: "Telefon numarası bulundu (+10 Puan)",
          });
        }

        if (biz.website) {
          calculatedScore += 5;
          interactionData.push({
            type: "PROFILE_WEB",
            scoreAdded: 5,
            description: "Web sitesi bulundu (+5 Puan)",
          });
        }

        // Kaydet
        const created = await db.lead.create({
          data: {
            name: biz.name || "Bilinmeyen Yetkili",
            companyName: biz.companyName,
            phone: biz.phone,
            website: biz.website,
            source: "GOOGLE_PLACES",
            status: "PROSPECT",
            score: calculatedScore,
            tenantId: "teknikel",
            communicationOptIn: false,
            interactions: {
              create: interactionData,
            },
          },
        });

        console.log(`   ✅ Kaydedildi! (ID: ${created.id})`);
        savedCount++;
      } catch (dbError) {
        errorCount++;
        const errorMsg = dbError.message || JSON.stringify(dbError);
        if (!firstError) {
          firstError = errorMsg;
        }
        console.error(`   ❌ Hata: ${errorMsg}`);
      }
    }

    console.log(`\n\n📊 Sonuç:`);
    console.log(`   ✅ Kaydedilen: ${savedCount}`);
    console.log(`   ❌ Hata: ${errorCount}`);
    if (firstError) {
      console.log(`   📌 İlk hata: ${firstError}`);
    }

    // Teknikel leads'i kontrol et
    const teknikelLeads = await db.lead.findMany({
      where: { tenantId: 'teknikel' },
    });
    console.log(`\n📋 Teknikel'deki toplam lead: ${teknikelLeads.length}`);

  } catch (error) {
    console.error('❌ Fatal hata:', error.message);
  } finally {
    await db.$disconnect();
  }
}

testScrape();
