import axios from 'axios';
import { logApiUsage } from '@ajans/db';
import { getGoogleSettings } from '../settings';

export interface BusinessResult {
  name: string;
  companyName: string;
  phone: string | null;
  address: string;
  website: string | null;
  placeId: string;
}

export async function searchBusinesses(query: string, location?: string): Promise<BusinessResult[]> {
  const settings = await getGoogleSettings();
  const apiKey = settings?.googlePlacesApiKey || process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Google Places API anahtarı (GOOGLE_PLACES_API_KEY) bulunamadı.');
  }

  // Kullanıcı "Kadıköy, İstanbul" gibi bir string lokasyon gönderiyorsa query ile birleştiriyoruz
  const fullQuery = location ? `${query} in ${location}` : query;

  try {
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

    // API kullanımını logla (Tahmini maliyet: 0.017 $)
    logApiUsage("GOOGLE_PLACES", "SEARCH_TEXT", 0.017);

    if (!response.data || !response.data.places) {
      console.warn('Google Places API: Sonuç bulunamadı veya geçersiz yanıt.', response.data);
      return [];
    }

    const places = response.data.places;

    return places.map((place: any) => ({
      name: place.displayName?.text || 'Bilinmeyen Yetkili',
      companyName: place.displayName?.text || 'Bilinmeyen Firma',
      phone: place.nationalPhoneNumber || null,
      address: place.formattedAddress || 'Adres bilgisi yok',
      website: place.websiteUri || null,
      placeId: place.id
    }));
  } catch (error: any) {
    const errorDetail = error.response?.data || error.message;
    console.error('Google Places API (New) Hatası:', JSON.stringify(errorDetail, null, 2));
    throw new Error(`Google API Hatası: ${error.response?.data?.error?.message || error.message}`);
  }
}
