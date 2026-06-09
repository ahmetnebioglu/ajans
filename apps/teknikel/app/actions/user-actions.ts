"use server";

import { uploadToDrive } from "@ajans/google-api";
import { unsecured_prisma as db } from "@ajans/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";

/**
 * Profil bilgilerini ve resmi günceller
 */
export async function updateProfile(formData: FormData) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.email) {
      return { success: false, error: "Oturum bulunamadı." };
    }

    const user = session.user as any;
    const name = formData.get("name") as string;
    const file = formData.get("avatar") as File;
    
    let imageUrl = user.image || "";

    // Eğer yeni bir dosya yüklendiyse
    if (file && file.size > 0 && file.name !== "undefined") {
      console.log(`[ProfileAction] Uploading new avatar: ${file.name}, size: ${file.size}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Google Drive'a yükle
      try {
        const driveFile = await uploadToDrive(
          buffer,
          `profile_${user.email.split('@')[0]}_${Date.now()}.jpg`,
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
        where: { email: user.email }, 
        data: {
          name: name || user.name,
          image: imageUrl
        }
      });
    });

    console.log(`[ProfileAction] Profile updated for ${user.email}`);

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
export async function changePassword(newPassword: string) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.email) return { success: false, error: "Yetkisiz" };

    const user = session.user as any;
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Şifre en az 6 karakter olmalıdır." };
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Veritabanında güncelle
    await db.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });

    console.log(`[PasswordAction] Password updated for ${user.email}`);
    return { success: true };
  } catch (error: any) {
    console.error("[PasswordAction] Error:", error);
    return { success: false, error: error.message };
  }
}
