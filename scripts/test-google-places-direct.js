const axios = require('axios');

const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';

async function testGooglePlaces() {
  try {
    console.log('🔍 Google Places API test başlıyor...');
    console.log('Query: "Kombi Servisi", Location: "Kadıköy, İstanbul"');
    
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: 'Kombi Servisi in Kadıköy, İstanbul',
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

    console.log('\n✅ API Yanıtı başarılı!');
    console.log(`📊 Bulunan işletme sayısı: ${response.data.places?.length || 0}`);
    
    if (response.data.places && response.data.places.length > 0) {
      console.log('\n📋 İlk 3 işletme:');
      response.data.places.slice(0, 3).forEach((place, idx) => {
        console.log(`\n${idx + 1}. ${place.displayName?.text || 'N/A'}`);
        console.log(`   Telefon: ${place.nationalPhoneNumber || 'Yok'}`);
        console.log(`   Web: ${place.websiteUri || 'Yok'}`);
        console.log(`   Adres: ${place.formattedAddress || 'Yok'}`);
      });
    } else {
      console.log('⚠️ API sonuç döndürmedi');
    }
  } catch (error) {
    console.error('❌ Hata:', error.response?.data || error.message);
  }
}

testGooglePlaces();
