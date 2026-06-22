'use server';

import { updateIdeasoftProduct, IdeasoftProductUpdateRequest } from '@/src/services/ideasoft';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Ideasoft ürün güncelleme server action'ı.
 */
export async function updateProductAction(id: number, data: IdeasoftProductUpdateRequest) {
  try {
    const updatedProduct = await updateIdeasoftProduct(id, data);

    if (!updatedProduct) {
      return { success: false, error: 'Ürün güncellenirken bir hata oluştu.' };
    }

    // İlgili cache'leri temizle
    revalidateTag('ideasoft-urunler', 'max');
    revalidatePath(`/urunler/${id}`);

    return { success: true, product: updatedProduct };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ürün güncellenirken beklenmedik bir hata oluştu.' };
  }
}
