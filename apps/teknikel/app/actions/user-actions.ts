"use server";

import { uploadToDrive } from "@ajans/google-api";
import { unsecured_prisma as db } from "@ajans/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Profil bilgilerini ve resmi günceller
 */
export async function updateProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Oturum bulunamadı." };
    }

    const name = formData.get("name") as string;
    const file = formData.get("avatar") as File;
    
    let imageUrl = session.user.image || "";

    // Eğer yeni bir dosya yüklendiyse
    if (file && file.size > 0 && file.name !== "undefined") {
      console.log(`[ProfileAction] Uploading new avatar: ${file.name}, size: ${file.size}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Google Drive'a yükle
      try {
        const driveFile = await uploadToDrive(
          buffer,
          `profile_${session.user.email.split('@')[0]}_${Date.now()}.jpg`,
          file.type,
          process.env.GOOGLE_DRIVE_FOLDER_ID
        );

        if (driveFile && driveFile.id) {
          console.log(`[ProfileAction] File uploaded to Drive, ID: ${driveFile.id}`);
          // Google Drive kısıtlamalarını aşmak için yerel Proxy API kullan
          imageUrl = `/api/drive-image?id=${driveFile.id}`;
        } else {
          console.error("[ProfileAction] Drive upload failed: No ID returned");
        }
      } catch (uploadError: any) {
        console.error("[ProfileAction] Drive upload exception:", uploadError);
        return { success: false, error: "Resim yükleme sırasında teknik bir hata oluştu: " + uploadError.message };
      }
    }

    // Veritabanını güncelle (SQL Transaction kullanarak - Kalıcı Senkronizasyon)
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: session.user.email }, 
        data: {
          name: name || session.user.name,
          image: imageUrl
        }
      });
    });

    console.log(`[ProfileAction] Profile updated for ${session.user.email}`);

    // Next.js Cache Patlatma
    revalidatePath("/profile");
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    
    return { success: true, imageUrl };
  } catch (error: any) {
    console.error("[ProfileAction] Update error:", error);
    return { success: false, error: error.message || "Profil güncellenemedi." };
  }
}

/**
 * Şifre değiştirme işlemi
 */
export async function changePassword(values: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Yetkisiz" };

    // Şifre hashleme ve güncelleme mantığı buraya gelecek
    // Şu an için simüle ediyoruz
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
