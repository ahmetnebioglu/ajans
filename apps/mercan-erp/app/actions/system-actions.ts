"use server";

import { revalidatePath } from "next/cache";
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
