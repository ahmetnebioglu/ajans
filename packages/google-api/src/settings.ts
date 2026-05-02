import { unsecured_prisma as db } from '@ajans/db';

declare global {
  var googleSettingsCache: any | undefined;
  var googleSettingsCacheExpiry: number | undefined;
}

export async function getGoogleSettings() {
  const now = Date.now();
  if (globalThis.googleSettingsCache && globalThis.googleSettingsCacheExpiry && globalThis.googleSettingsCacheExpiry > now) {
    return globalThis.googleSettingsCache;
  }

  const settings = await db.siteSettings.findUnique({
    where: { id: 'global' }
  });

  if (settings) {
    globalThis.googleSettingsCache = settings;
    globalThis.googleSettingsCacheExpiry = now + 10 * 60 * 1000;
  }

  return settings;
}
