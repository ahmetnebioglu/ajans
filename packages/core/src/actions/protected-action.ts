import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: string;
    tenantId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
import { getSecuredPrisma } from "@ajans/db";
import { Session } from "next-auth";

/**
 * Güvenlik Kapısı (Interceptor):
 * Session kontrolü, auth doğrulaması ve merkezi hata yakalama işlemlerini yürütür.
 */

export interface ActionContext {
  session: Session;
  user: Session["user"];
  tenantId: string;
  db: ReturnType<typeof getSecuredPrisma>;
}

export type ActionResponse<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

export async function protectedAction<T>(
  action: (context: ActionContext) => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("UNAUTHORIZED");
    }

    const user = session.user;
    const tenantId = user.tenantId || "mercan"; // Varsayılan kiracı

    const db = getSecuredPrisma(tenantId);

    const result = await action({ 
      session, 
      user, 
      tenantId, 
      db 
    });

    return { success: true, data: result };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    
    console.error("Server Action Interceptor Error:", errorMessage);

    if (errorMessage === "UNAUTHORIZED") {
      return { success: false, error: "Bu işlem için yetkiniz bulunmamaktadır (Oturum kapalı)." };
    }

    return { 
      success: false, 
      error: errorMessage || "İşlem sırasında sunucu tarafında bir hata oluştu." 
    };
  }
}
