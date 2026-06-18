"use server";

import { uploadFile } from "@ajans/core";
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
      
      // S3/R2'ye yükle
      try {
        const uploadTenant = user.tenantId || "teknikel";
        const s3Resp = await uploadFile(
          buffer,
          `profile_${user.email.split('@')[0]}_${Date.now()}.jpg`,
          file.type,
          uploadTenant,
          "avatars"
        );

        if (s3Resp && s3Resp.key) {
          console.log(`[ProfileAction] File uploaded to R2, Key: ${s3Resp.key}`);
          imageUrl = s3Resp.url;
        } else {
          console.error("[ProfileAction] R2 upload failed: No Key returned");
        }
      } catch (uploadError: any) {
        console.error("[ProfileAction] R2 upload exception:", uploadError);
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
