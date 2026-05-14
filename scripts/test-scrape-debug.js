const axios = require('axios');
require('dotenv').config({ path: 'apps/teknikel/.env.local' });

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
    console.log('🔍 Scrape debug başlıyor...\n');
    
    // Google Places'tan veri çek
    const businesses = await searchBusinesses('Kombi Servisi', 'Kadıköy, İstanbul');
    console.log(`✅ Google Places'tan ${businesses.length} işletme bulundu\n`);
    
    if (businesses.length === 0) {
      console.log('⚠️ Hiç işletme bulunamadı');
      process.exit(0);
    }

    // İlk 3 işletmeyi detaylı göster
    console.log('📋 İlk 3 işletme:');
    businesses.slice(0, 3).forEach((biz, i) => {
      console.log(`\n${i + 1}. ${biz.companyName}`);
      console.log(`   Telefon: ${biz.phone || 'Yok'}`);
      console.log(`   Web: ${biz.website || 'Yok'}`);
      console.log(`   Adres: ${biz.address}`);
      console.log(`   PlaceId: ${biz.placeId}`);
    });

    // Dedupe mantığını test et
    console.log('\n\n🔍 Dedupe mantığı testi:');
    const testBiz = businesses[0];
    console.log(`\nTest işletme: ${testBiz.companyName}`);
    console.log(`Telefon: ${testBiz.phone}`);
    console.log(`Name: ${testBiz.name}`);
    
    const dedupeConditions = [];
    if (testBiz.phone) {
      dedupeConditions.push({ phone: testBiz.phone });
      console.log('✅ Phone condition eklendi');
    }
    if (testBiz.companyName && testBiz.name) {
      dedupeConditions.push({
        companyName: testBiz.companyName,
        name: testBiz.name,
      });
      console.log('✅ CompanyName+Name condition eklendi');
    }
    
    console.log(`\nDedupe conditions: ${JSON.stringify(dedupeConditions, null, 2)}`);

    // Skor hesaplama testi
    console.log('\n\n📊 Skor hesaplama testi:');
    let calculatedScore = 0;
    const interactionData = [];

    interactionData.push({
      type: "CREATED",
      scoreAdded: 0,
      description: `Sisteme eklendi (Google Places)`,
    });

    if (testBiz.phone) {
      calculatedScore += 10;
      interactionData.push({
        type: "PROFILE_PHONE",
        scoreAdded: 10,
        description: "Telefon numarası bulundu (+10 Puan)",
      });
    }

    if (testBiz.website) {
      calculatedScore += 5;
      interactionData.push({
        type: "PROFILE_WEB",
        scoreAdded: 5,
        description: "Web sitesi bulundu (+5 Puan)",
      });
    }

    console.log(`Hesaplanan skor: ${calculatedScore}`);
    console.log(`Interaction data: ${JSON.stringify(interactionData, null, 2)}`);

    // Lead create payload'ını göster
    console.log('\n\n📝 Lead create payload:');
    const payload = {
      name: testBiz.name || "Bilinmeyen Yetkili",
      companyName: testBiz.companyName,
      phone: testBiz.phone,
      website: testBiz.website,
      source: "GOOGLE_PLACES",
      status: "PROSPECT",
      score: calculatedScore,
      tenantId: "teknikel",
      communicationOptIn: false,
      interactions: {
        create: interactionData,
      },
    };
    console.log(JSON.stringify(payload, null, 2));

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

testScrape();
