import { unsecured_prisma as db } from '@ajans/db';

declare global {
  var siteSettingsCache: any | undefined;
  var siteSettingsCacheExpiry: number | undefined;
}

/**
 * Veritabanından sistem ayarlarını çeker ve 10 dakika boyunca bellekte saklar.
 */
export async function getCachedSettings() {
  const now = Date.now();
  
  if (
    globalThis.siteSettingsCache && 
    globalThis.siteSettingsCacheExpiry && 
    globalThis.siteSettingsCacheExpiry > now
  ) {
    return globalThis.siteSettingsCache;
  }

  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'global' }
    });

    if (settings) {
      globalThis.siteSettingsCache = settings;
      globalThis.siteSettingsCacheExpiry = now + 10 * 60 * 1000; // 10 dakika önbellek
    }

    return settings;
  } catch (error) {
    console.error('[SettingsService] Error fetching site settings:', error);
    return null;
  }
}

/**
 * Önbelleği temizler (Ayarlar güncellendiğinde çağrılmalı).
 */
export function clearSettingsCache() {
  globalThis.siteSettingsCache = undefined;
  globalThis.siteSettingsCacheExpiry = undefined;
}
