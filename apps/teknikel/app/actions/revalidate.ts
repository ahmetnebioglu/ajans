"use server";

import { revalidatePath } from "next/cache";

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
