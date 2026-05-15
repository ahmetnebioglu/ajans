"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateLeads() {
  try {
    revalidatePath("/leads");
    revalidatePath("/vip");
    revalidatePath("/"); // Dashboard
    return { success: true };
  } catch (error) {
    console.error("Revalidation error:", error);
    return { success: false, error: "Önbellek yenilenirken bir hata oluştu." };
  }
}

// Bilsoft Cache Revalidation
export async function revalidateCariler() {
  try {
    revalidateTag("bilsoft-cariler", "max");
    return { success: true };
  } catch (error) {
    console.error("Cariler revalidation error:", error);
    return { success: false, error: "Cariler önbelleği yenilenirken bir hata oluştu." };
  }
}

export async function revalidateFaturalar() {
  try {
    revalidateTag("bilsoft-faturalar", "max");
    return { success: true };
  } catch (error) {
    console.error("Faturalar revalidation error:", error);
    return { success: false, error: "Faturalar önbelleği yenilenirken bir hata oluştu." };
  }
}

export async function revalidateStoklar() {
  try {
    revalidateTag("bilsoft-stoklar", "max");
    return { success: true };
  } catch (error) {
    console.error("Stoklar revalidation error:", error);
    return { success: false, error: "Stoklar önbelleği yenilenirken bir hata oluştu." };
  }
}

// Ideasoft Cache Revalidation
export async function revalidateMusteriler() {
  try {
    revalidateTag("ideasoft-musteriler", "max");
    return { success: true };
  } catch (error) {
    console.error("Müşteriler revalidation error:", error);
    return { success: false, error: "Müşteriler önbelleği yenilenirken bir hata oluştu." };
  }
}

export async function revalidateUrunler() {
  try {
    revalidateTag("ideasoft-urunler", "max");
    return { success: true };
  } catch (error) {
    console.error("Ürünler revalidation error:", error);
    return { success: false, error: "Ürünler önbelleği yenilenirken bir hata oluştu." };
  }
}

export async function revalidateSiparisler() {
  try {
    revalidateTag("ideasoft-siparisler", "max");
    return { success: true };
  } catch (error) {
    console.error("Siparisler revalidation error:", error);
    return { success: false, error: "Siparisler önbelleği yenilenirken bir hata oluştu." };
  }
}
