"use server";

import { uploadToDrive } from "@ajans/google-api";
import { unsecured_prisma as db } from "@ajans/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
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
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Google Drive'a yükle
      const driveFile = await uploadToDrive(
        buffer,
        `profile_${session.user.email.split('@')[0]}_${Date.now()}.jpg`,
        file.type,
        process.env.GOOGLE_DRIVE_FOLDER_ID
      );

      if (driveFile && driveFile.id) {
        // Direct link format for Google Drive (publicly shared)
        imageUrl = `https://lh3.google.com/u/0/d/${driveFile.id}`;
        // Alternatif: https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w1000
        imageUrl = `https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w800`;
      }
    }

    // Veritabanını güncelle
    await db.user.update({
      where: { email: session.user.email },
      data: {
        name: name || session.user.name,
        image: imageUrl
      }
    });

    revalidatePath("/profile");
    revalidatePath("/");
    
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
