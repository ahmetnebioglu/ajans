const axios = require('axios');

const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
const query = 'kombi servisi';
const location = 'Kadıköy, İstanbul';
const fullQuery = `${query} in ${location}`;

console.log(`[TEST] Google Places API Test`);
console.log(`Query: "${fullQuery}"`);
console.log(`API Key: ${apiKey.substring(0, 10)}...`);
console.log('---');

axios.post(
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
)
  .then(response => {
    console.log(`✅ API Başarılı`);
    console.log(`Toplam sonuç: ${response.data.places?.length || 0}`);
    if (response.data.places && response.data.places.length > 0) {
      console.log('\nİlk 3 sonuç:');
      response.data.places.slice(0, 3).forEach((place, i) => {
        console.log(`\n${i + 1}. ${place.displayName?.text || 'N/A'}`);
        console.log(`   Telefon: ${place.nationalPhoneNumber || 'Yok'}`);
        console.log(`   Web: ${place.websiteUri || 'Yok'}`);
        console.log(`   Adres: ${place.formattedAddress || 'N/A'}`);
      });
    }
  })
  .catch(error => {
    console.error(`❌ API Hatası`);
    console.error(`Status: ${error.response?.status}`);
    console.error(`Message: ${error.response?.data?.error?.message || error.message}`);
    console.error(`Details:`, JSON.stringify(error.response?.data, null, 2));
  });
