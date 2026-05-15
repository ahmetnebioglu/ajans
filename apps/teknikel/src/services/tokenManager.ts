import { unsecured_prisma as db } from '@ajans/db';
import axios from 'axios';

/**
 * Merkezi Token Yönetim Servisi
 * Ideasoft, Bilsoft ve diğer 3. parti entegrasyonlar için güvenli token yönetimi sağlar.
 */

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

/**
 * Belirtilen sağlayıcı için geçerli bir token döner.
 * Emniyet Ventili: Süresi dolmaya 10 dakika kala otomatik yenileme yapar.
 */
export async function getValidToken(provider: string): Promise<string> {
  const safetyMargin = 10 * 60 * 1000; // 10 dakika emniyet ventili
  const now = new Date();

  // 1. Veritabanından mevcut token'ı al
  const tokenRecord = await db.apiToken.findUnique({
    where: { provider }
  });

  if (tokenRecord) {
    const isExpiring = tokenRecord.expiresAt.getTime() < now.getTime() + safetyMargin;

    if (!isExpiring) {
      return tokenRecord.accessToken;
    }

    console.log(`[TokenManager] ${provider} token süresi dolmak üzere veya dolmuş, yenileniyor...`);
  } else {
    console.log(`[TokenManager] ${provider} için kayıtlı token bulunamadı, yeni alınıyor...`);
  }

  // 2. Token yenileme (Refresh) mantığı
  let newTokenData: TokenData;

  switch (provider) {
    case 'ideasoft':
      newTokenData = await refreshIdeasoftToken(tokenRecord?.refreshToken);
      break;
    case 'bilsoft':
      newTokenData = await refreshBilsoftToken();
      break;
    default:
      throw new Error(`Bilinmeyen sağlayıcı: ${provider}`);
  }

  // 3. Veritabanını güncelle
  await db.apiToken.upsert({
    where: { provider },
    update: {
      accessToken: newTokenData.accessToken,
      refreshToken: newTokenData.refreshToken || null,
      expiresAt: newTokenData.expiresAt,
    },
    create: {
      provider,
      accessToken: newTokenData.accessToken,
      refreshToken: newTokenData.refreshToken || null,
      expiresAt: newTokenData.expiresAt,
    }
  });

  return newTokenData.accessToken;
}

/**
 * Ideasoft Refresh Token Akışı
 * İlk kurulumda OAuth2 authorization_code akışı ile refresh_token elde edilmeli.
 * Sonrasında bu fonksiyon refresh_token kullanarak otonom yenileme yapar.
 */
async function refreshIdeasoftToken(refreshToken?: string | null): Promise<TokenData> {
  const domain = process.env.domain || 'https://teknikelkombi.myideasoft.com';
  const clientId = process.env.client_id;
  const clientSecret = process.env.client_secret;

  // Refresh token yoksa ilk kurulum yapılmamış demektir.
  // Kullanıcının Settings sayfasından "IdeaSoft'a Bağlan" butonuna tıklaması gerekir.
  if (!refreshToken) {
    throw new Error(
      'IdeaSoft refresh token bulunamadı. ' +
      'Lütfen Ayarlar > Sistem Bağlantıları sayfasından IdeaSoft entegrasyonunu başlatın.'
    );
  }

  if (!clientId || !clientSecret) {
    throw new Error('IdeaSoft OAuth yapılandırması eksik (client_id veya client_secret).');
  }

  try {
    const response = await axios.post(
      `${domain}/oauth/v2/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        validateStatus: (status) => status < 500,
      }
    );

    if (response.status !== 200) {
      console.error('[TokenManager] IdeaSoft refresh token yanıtı:', response.status, response.data);
      throw new Error(
        `IdeaSoft token yenileme başarısız (HTTP ${response.status}). ` +
        'Refresh token geçersiz olabilir. Lütfen IdeaSoft entegrasyonunu yeniden başlatın.'
      );
    }

    const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('IdeaSoft token yanıtında access_token eksik.');
    }

    return {
      accessToken: access_token,
      // IdeaSoft her refresh'te yeni refresh_token döndürebilir; döndürmezse eskisini koru
      refreshToken: new_refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + (expires_in || 86400) * 1000),
    };
  } catch (error: any) {
    if (error.response) {
      console.error('[TokenManager] IdeaSoft API hatası:', error.response.status, error.response.data);
    }
    throw error;
  }
}

/**
 * IdeaSoft API çağrılarında hata gelirse (401/403) token yenile ve tekrar dene
 * Reactive retry pattern: hata gelince refresh et, bir kez daha dene
 */
export async function fetchWithIdeasoftRetry(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Mevcut token'ı al (proaktif yenileme de yapılır)
  let token = await getValidToken('ideasoft');

  // 2. İlk isteği yap
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // 3. 401 veya 403 gelirse → token yenile → tekrar dene
  if (response.status === 401 || response.status === 403) {
    console.log(
      '[TokenManager] IdeaSoft 401/403 hatası, refresh token deneniyor...'
    );

    // DB'den refresh_token al
    const tokenRecord = await db.apiToken.findUnique({
      where: { provider: 'ideasoft' },
    });

    if (!tokenRecord?.refreshToken) {
      throw new Error(
        'IdeaSoft refresh token bulunamadı. Lütfen IdeaSoft entegrasyonunu yeniden başlatın.'
      );
    }

    try {
      // Yeni token al
      const newTokenData = await refreshIdeasoftToken(
        tokenRecord.refreshToken
      );

      // DB'ye yaz
      await db.apiToken.update({
        where: { provider: 'ideasoft' },
        data: {
          accessToken: newTokenData.accessToken,
          refreshToken: newTokenData.refreshToken,
          expiresAt: newTokenData.expiresAt,
        },
      });

      // 4. Yeni token ile tekrar dene (tek seferlik retry)
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokenData.accessToken}`,
        },
      });

      console.log(
        '[TokenManager] Retry başarılı, yeni token ile istek tekrarlandı.'
      );
    } catch (refreshError: any) {
      console.error(
        '[TokenManager] Token yenileme başarısız:',
        refreshError.message
      );
      throw refreshError;
    }
  }

  return response;
}

/**
 * Bilsoft Login Akışı (Bilsoft'ta refresh token yerine login kullanılır)
 */
async function refreshBilsoftToken(): Promise<TokenData> {
  // apps/teknikel/src/services/bilsoft.ts içindeki mantığı kullanıyoruz
  const dbConfig = await db.bilsoftConfig.findUnique({
    where: { tenantId: 'teknikel' }
  });

  const credentials = {
    apiKullaniciAdi: dbConfig?.apiUser || process.env.BILSOFT_API_USER,
    apiKullaniciSifre: dbConfig?.apiPassword || process.env.BILSOFT_API_PASSWORD,
    donemYil: dbConfig?.year || process.env.BILSOFT_YEAR,
    kullaniciAdi: dbConfig?.user || process.env.BILSOFT_USER,
    kullaniciSifre: dbConfig?.password || process.env.BILSOFT_PASSWORD,
    subeAd: dbConfig?.branch || process.env.BILSOFT_BRANCH,
    vergiNumarasi: dbConfig?.taxNumber || process.env.BILSOFT_TAX_NUMBER,
    veritabaniAd: dbConfig?.dbName || process.env.BILSOFT_DB_NAME,
  };

  const response = await fetch('https://apiv3.bilsoft.com/api/Auth/GirisYap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!result.success || !result.data?.token) {
    throw new Error(result.message || 'Bilsoft login failed');
  }

  return {
    accessToken: result.data.token,
    expiresAt: new Date(result.data.expiration)
  };
}
