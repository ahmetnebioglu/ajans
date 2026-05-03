import axios from 'axios';
import { getLocalTokens, saveLocalTokens, syncTokensFromAtlas, IdeasoftToken } from '@/utils/ideasoft-auth';

/**
 * Ideasoft API Entegrasyon Servisi
 */

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  targetUrl: string;
  category?: string;
  description?: string;
}

const DOMAIN = process.env.domain || 'https://teknikelkombi.myideasoft.com';
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;

/**
 * Aktif Ideasoft access token'ını döner. 
 * Eğer token yoksa Atlas'tan çeker, süresi dolmuşsa refresh token ile yeniler.
 */
export async function getIdeasoftAccessToken(): Promise<string> {
  let tokens = getLocalTokens();

  // 1. Eğer hiç token yoksa Atlas'tan senkronize et
  if (!tokens) {
    tokens = await syncTokensFromAtlas();
  }

  // 2. Token süresini kontrol et (5 dakika pay bırakarak)
  // Not: expires_in genellikle saniye cinsindendir. 
  // updatedAt + expiresIn < now ise süresi dolmuştur.
  const updatedAt = tokens.updatedAt ? new Date(tokens.updatedAt).getTime() : 0;
  const isExpired = updatedAt + (tokens.expiresIn * 1000) < Date.now() + 300000;

  if (isExpired) {
    console.log('Ideasoft token süresi dolmuş, yenileniyor...');
    try {
      const response = await axios.post(`${DOMAIN}/oauth/v2/token`, new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        refresh_token: tokens.refreshToken,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      
      const newTokens: IdeasoftToken = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
        updatedAt: new Date().toISOString()
      };

      saveLocalTokens(newTokens);
      return access_token;
    } catch (error: any) {
      console.error('Token yenileme hatası, Atlas\'tan tekrar denenecek:', error.response?.data || error.message);
      // Refresh başarısız olursa Atlas'tan temiz çekmeyi dene
      const freshTokens = await syncTokensFromAtlas();
      return freshTokens.accessToken;
    }
  }

  return tokens.accessToken;
}

/**
 * Ideasoft API'sinden vitrin ürünlerini çeker.
 */
export async function getShowcaseProducts(): Promise<Product[]> {
  try {
    const token = await getIdeasoftAccessToken();
    
    // Showcase ürünlerini çekmek için vitrin kategorisi veya özel bir filtre kullanılabilir.
    // Şimdilik en son eklenen 6 ürünü çekiyoruz.
    const response = await axios.get(`${DOMAIN}/admin-api/products?limit=6&sort=-id`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.data || !Array.isArray(response.data.data)) {
      return [];
    }

    const ideasoftProducts = response.data.data;

    return ideasoftProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: `${p.price1} TL`, // Para birimi p.currency'den de alınabilir
      image: p.images && p.images.length > 0 
        ? p.images[0].originalUrl || p.images[0].thumbUrl 
        : 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=400',
      targetUrl: `${DOMAIN}/${p.slug}`,
      category: p.category ? p.category.name : 'Genel',
      description: p.shortDetails || p.name
    }));
  } catch (error) {
    console.error('Ürünler çekilirken hata oluştu:', error);
    // Hata durumunda boş dizi dön veya mock verilere fallback yap
    return [];
  }
}

