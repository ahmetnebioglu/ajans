"use server";

import { revalidatePath } from "next/cache";
import { unsecured_prisma as db } from "@ajans/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Güvenli aksiyon sarmalayıcısı (Teknikel özel basitleştirilmiş sürüm)
 */
async function protectedAction<T>(fn: (ctx: { db: any, user: any }) => Promise<T>) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    console.warn("[AUTH WARNING]: Session not found in getServerSession", { 
      hasSession: !!session, 
      hasUser: !!session?.user 
    });
    return { success: false, error: "Yetkisiz erişim" };
  }
  
  try {
    const result = await fn({ db, user: session.user });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[ACTION ERROR]:", error.message);
    return { success: false, error: error.message };
  }
}

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
    const session = await db.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("Oturum bulunamadı");
    }

    if (session.userId !== (user as any).id) {
      const currentUser = await db.user.findUnique({ where: { id: (user as any).id } });
      if (currentUser?.role !== "ADMIN") {
        throw new Error("Bu işlem için yetkiniz yok");
      }
    }

    await db.session.delete({
      where: { id: sessionId },
    });

    revalidatePath("/sessions");
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

    revalidatePath("/sessions");
    return { success: true };
  });
}
