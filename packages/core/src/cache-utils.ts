/**
 * Müşteri kimliğini zorunlu kılan bir önbellek etiketi üretir.
 * Bu etiket, Next.js 'fetch' veya 'unstable_cache' fonksiyonlarında kullanılarak
 * farklı müşterilerin verilerinin aynı önbellek slotuna girmesini (leak) engeller.
 * 
 * @param tenantId Kiracı kimliği (Örn: "mercan")
 * @param resource Kaynak adı (Örn: "announcements", "posts")
 * @returns Format: tenant-{tenantId}-{resource}
 */
export function getTenantCacheTag(tenantId: string, resource: string): string {
  if (!tenantId || !resource) {
    throw new Error("tenantId ve resource parametreleri zorunludur.");
  }
  return `tenant-${tenantId}-${resource}`;
}
