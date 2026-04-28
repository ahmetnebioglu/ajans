'use server'

/**
 * Entegrasyonların (Resend, Google vb.) durumlarını kontrol eder.
 * API anahtarlarını sızdırmadan sadece varlık kontrolü yapar.
 */
export async function getIntegrationStatuses() {
  return {
    resend: !!process.env.RESEND_API_KEY,
    googleDrive: !!process.env.GOOGLE_REFRESH_TOKEN || !!process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
    googlePlaces: !!process.env.GOOGLE_PLACES_API_KEY,
    database: !!process.env.DATABASE_URL,
  };
}
