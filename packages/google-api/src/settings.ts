import { unsecured_prisma as db } from '@ajans/db';

declare global {
  var googleSettingsCache: Record<string, any> | undefined;
  var googleSettingsCacheExpiry: Record<string, number> | undefined;
}

export async function getGoogleSettings(tenantId: string = "mercan") {
  const now = Date.now();
  
  if (!globalThis.googleSettingsCache) {
    globalThis.googleSettingsCache = {};
  }
  if (!globalThis.googleSettingsCacheExpiry) {
    globalThis.googleSettingsCacheExpiry = {};
  }

  if (
    globalThis.googleSettingsCache[tenantId] && 
    globalThis.googleSettingsCacheExpiry[tenantId] && 
    globalThis.googleSettingsCacheExpiry[tenantId] > now
  ) {
    return globalThis.googleSettingsCache[tenantId];
  }

  const settings = await db.siteSettings.findUnique({
    where: { tenantId }
  });

  if (settings) {
    globalThis.googleSettingsCache[tenantId] = settings;
    globalThis.googleSettingsCacheExpiry[tenantId] = now + 10 * 60 * 1000;
  }

  return settings;
}
