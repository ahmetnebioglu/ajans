"use server";

import { revalidateTag } from "next/cache";
import { getTenantCacheTag } from "../cache-utils";

/**
 * SADECE ilgili müşterinin önbelleğini temizleyen Server Action fonksiyonu.
 * Veri güncellendiğinde (Create/Update/Delete) bu fonksiyon çağrılarak
 * sadece o müşteriye ait sayfaların yenilenmesi sağlanır.
 */
export async function revalidateTenantCache(tenantId: string, resource: string): Promise<void> {
  const tag = getTenantCacheTag(tenantId, resource);
  revalidateTag(tag, "default");
}
