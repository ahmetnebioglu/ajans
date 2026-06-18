import { unsecured_prisma as db } from '@ajans/db';

declare global {
  var siteSettingsCache: Record<string, any> | undefined;
  var siteSettingsCacheExpiry: Record<string, number> | undefined;
}

/**
 * Veritabanından sistem ayarlarını çeker ve 10 dakika boyunca bellekte saklar.
 */
export async function getCachedSettings(tenantId: string = "mercan") {
  const now = Date.now();
  
  if (!globalThis.siteSettingsCache) {
    globalThis.siteSettingsCache = {};
  }
  if (!globalThis.siteSettingsCacheExpiry) {
    globalThis.siteSettingsCacheExpiry = {};
  }

  if (
    globalThis.siteSettingsCache[tenantId] && 
    globalThis.siteSettingsCacheExpiry[tenantId] && 
    globalThis.siteSettingsCacheExpiry[tenantId] > now
  ) {
    return globalThis.siteSettingsCache[tenantId];
  }

  try {
    const settings = await db.siteSettings.findUnique({
      where: { tenantId }
    });

    if (settings) {
      globalThis.siteSettingsCache[tenantId] = settings;
      globalThis.siteSettingsCacheExpiry[tenantId] = now + 10 * 60 * 1000; // 10 dakika önbellek
    }

    return settings;
  } catch (error) {
    console.error(`[SettingsService] Error fetching site settings for tenant ${tenantId}:`, error);
    return null;
  }
}

/**
 * Önbelleği temizler (Ayarlar güncellendiğinde çağrılmalı).
 */
export function clearSettingsCache(tenantId?: string) {
  if (!globalThis.siteSettingsCache) return;
  
  if (tenantId) {
    delete globalThis.siteSettingsCache[tenantId];
    if (globalThis.siteSettingsCacheExpiry) {
      delete globalThis.siteSettingsCacheExpiry[tenantId];
    }
  } else {
    globalThis.siteSettingsCache = undefined;
    globalThis.siteSettingsCacheExpiry = undefined;
  }
}
