'use server';

import { getSecuredPrisma } from '@ajans/db';

/**
 * IdeaSoft entegrasyon durumunu döner.
 * Settings sayfasında kart bilgisi için kullanılır.
 */
export async function getIdeasoftStatus() {
  try {
    const db = getSecuredPrisma("teknikel");
    const token = await db.apiToken.findUnique({
      where: { provider: 'ideasoft' },
    });

    if (!token) {
      return {
        success: true,
        isConnected: false,
        expiry: null,
        lastSync: null,
        hasRefreshToken: false,
        message: 'IdeaSoft bağlantısı henüz kurulmamış.',
      };
    }

    const now = new Date();
    const isExpired = token.expiresAt < now;
    const hasRefreshToken = !!token.refreshToken;

    return {
      success: true,
      isConnected: !isExpired && hasRefreshToken,
      expiry: token.expiresAt.toISOString(),
      lastSync: token.updatedAt.toISOString(),
      hasRefreshToken,
      isExpired,
      message: isExpired
        ? 'Access token süresi dolmuş, refresh token ile yenilenecek.'
        : 'Bağlantı aktif.',
    };
  } catch (error: any) {
    return {
      success: false,
      isConnected: false,
      expiry: null,
      lastSync: null,
      hasRefreshToken: false,
      message: 'Durum bilgisi alınamadı: ' + error.message,
    };
  }
}

/**
 * IdeaSoft token kaydını siler (bağlantıyı keser).
 * Yeniden bağlanmak için OAuth akışının baştan başlatılması gerekir.
 */
export async function disconnectIdeasoft() {
  try {
    const db = getSecuredPrisma("teknikel");
    await db.apiToken.delete({
      where: { provider: 'ideasoft' },
    });
    return { success: true, message: 'IdeaSoft bağlantısı kesildi.' };
  } catch (error: any) {
    // Kayıt yoksa da başarılı say
    if (error.code === 'P2025') {
      return { success: true, message: 'IdeaSoft bağlantısı zaten mevcut değildi.' };
    }
    return { success: false, error: error.message };
  }
}
