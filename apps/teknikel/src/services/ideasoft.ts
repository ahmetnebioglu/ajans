import axios from 'axios';
import { getValidToken } from './tokenManager';

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

/**
 * Aktif Ideasoft access token'ını döner. 
 * Merkezi TokenManager üzerinden otonom yenileme yapar.
 */
export async function getIdeasoftAccessToken(): Promise<string> {
  return getValidToken('ideasoft');
}

/**
 * Ideasoft API'sinden vitrin ürünlerini çeker.
 */
export async function getShowcaseProducts(): Promise<Product[]> {
  try {
    const token = await getIdeasoftAccessToken();
    
    // Showcase ürünlerini çekmek için vitrin kategorisi veya özel bir filtre kullanılabilir.
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

