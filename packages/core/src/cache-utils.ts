import { revalidateTag } from "next/cache";

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

/**
 * SADECE ilgili müşterinin önbelleğini temizleyen Server Action helper fonksiyonu.
 * Veri güncellendiğinde (Create/Update/Delete) bu fonksiyon çağrılarak
 * sadece o müşteriye ait sayfaların yenilenmesi sağlanır.
 * 
 * @param tenantId Kiracı kimliği
 * @param resource Kaynak adı
 */
export function revalidateTenantCache(tenantId: string, resource: string): void {
  const tag = getTenantCacheTag(tenantId, resource);
  revalidateTag(tag, "default");
}

/**
 * ÖRNEK KULLANIM:
 * 
 * --- Veri Çekme (Server Component / Action) ---
 * const posts = await unstable_cache(
 *   () => db.post.findMany({ where: { tenantId } }),
 *   ["posts"],
 *   { tags: [getTenantCacheTag(tenantId, "posts")] }
 * )();
 * 
 * --- Veri Güncelleme (Server Action) ---
 * await db.post.create({ data: { ... } });
 * revalidateTenantCache(tenantId, "posts");
 */
