"use server";

import { revalidatePath } from "next/cache";
import { uploadFile } from "@ajans/core";
import { protectedAction } from "@ajans/core/server";

/**
 * Kullanıcının aktif oturumlarını getirir
 */
export async function getUserSessions() {
  return protectedAction(async ({ db, user }) => {
    return await db.session.findMany({
      where: { userId: (user as any).id },
      orderBy: { expires: "desc" },
    });
  });
}

/**
 * Belirli bir oturumu sonlandırır
 */
export async function killSession(sessionId: string) {
  return protectedAction(async ({ db, user }) => {
    // Güvenlik kontrolü: Sadece kendi oturumunu silebilir (veya ADMIN ise başkasınınkini silebilir ama burada kendi oturumları hedefleniyor)
    const session = await db.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Oturum bulunamadı");
    }

    if (session.userId !== (user as any).id) {
      // ADMIN kontrolü eklenebilir
      const currentUser = await db.user.findUnique({ where: { id: (user as any).id } });
      if (currentUser?.role !== "ADMIN") {
        throw new Error("Bu işlem için yetkiniz yok");
      }
    }

    await db.session.delete({
      where: { id: sessionId },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  });
}

/**
 * Diğer tüm oturumları kapatır (Mevcut olan hariç)
 */
export async function killOtherSessions(currentSessionToken: string) {
  return protectedAction(async ({ db, user }) => {
    await db.session.deleteMany({
      where: {
        userId: (user as any).id,
        NOT: {
          sessionToken: currentSessionToken,
        },
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  });
}

/**
 * Kullanıcı profil bilgilerini günceller
 */
export async function updateProfile(formData: FormData) {
  return protectedAction(async ({ db, user, tenantId }) => {
    const name = formData.get("name") as string;
    const file = formData.get("image") as File | null;
    
    let imageUrl = (user as any).image;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `profile_${user.id}_${Date.now()}`;
      const uploadTenant = tenantId || (user as any).tenantId || "mercan";
      const s3Resp = await uploadFile(buffer, fileName, file.type, uploadTenant, "profiles");
      imageUrl = s3Resp.url;
    }

    const updatedUser = await db.user.update({
      where: { id: (user as any).id },
      data: {
        name: name,
        image: imageUrl,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true, user: updatedUser };
  });
}
