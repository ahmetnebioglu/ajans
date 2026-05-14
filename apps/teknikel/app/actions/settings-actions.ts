'use server'

import { getSecuredPrisma } from '@ajans/db';
import { revalidatePath } from 'next/cache';
import { clearSettingsCache } from '@ajans/core';

/**
 * Entegrasyonların (Resend, Google vb.) durumlarını kontrol eder.
 * API anahtarlarını sızdırmadan sadece varlık kontrolü yapar.
 */
export async function getIntegrationStatuses() {
  const db = getSecuredPrisma("teknikel");
  const settings = await db.siteSettings.findUnique({ where: { id: 'global' } });
  const bilsoft = await db.bilsoftConfig.findUnique({ where: { tenantId: 'teknikel' } });

  return {
    resend: !!settings?.resendApiKey || !!process.env.RESEND_API_KEY,
    googleDrive: !!settings?.googleDriveApiKey || !!process.env.GOOGLE_REFRESH_TOKEN || !!process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    googlePlaces: !!settings?.googlePlacesApiKey || !!process.env.GOOGLE_PLACES_API_KEY,
    database: true,
    netgsm: (!!settings?.netgsmUsercode && !!settings?.netgsmPassword) || (!!process.env.NETGSM_USERCODE && !!process.env.NETGSM_PASSWORD),
    bilsoft: !!bilsoft || (!!process.env.BILSOFT_USER && !!process.env.BILSOFT_PASSWORD),
  };
}

/**
 * Mevcut entegrasyon ayarlarını getirir.
 */
export async function getIntegrationSettings() {
  const db = getSecuredPrisma("teknikel");
  return await db.siteSettings.findUnique({ where: { id: 'global' } });
}

/**
 * Entegrasyon ayarlarını günceller.
 */
export async function updateIntegrationSettings(data: any) {
  try {
    const db = getSecuredPrisma("teknikel");
    // Sadece izin verilen alanları güncelle (Güvenlik için)
    const allowedFields = [
      'googlePlacesApiKey', 
      'googleDriveApiKey', 
      'googleClientId',
      'googleClientSecret',
      'googleRefreshToken',
      'googleDriveFolderId',
      'resendApiKey', 
      'netgsmUsercode', 
      'netgsmPassword'
    ];
    
    const filteredData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        filteredData[key] = data[key];
      }
    }

    await db.siteSettings.upsert({
      where: { id: 'global' },
      create: { id: 'global', ...filteredData },
      update: filteredData,
    });
    
    // Core paketindeki önbelleği temizle
    clearSettingsCache();
    
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('[SettingsActions] Update Error:', error);
    return { success: false, error: error.message };
  }
}
