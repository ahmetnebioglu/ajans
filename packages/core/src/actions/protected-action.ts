import { getServerSession } from "next-auth/next";
import { authOptions } from "@ajans/auth/options";
import { getSecuredPrisma } from "@ajans/db";
import { Session } from "next-auth";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  tenantId: string | null;
  currentWorkspaceId: string | null;
  permissions: string[];
  availableWorkspaces: { id: string; name: string; roleId: string | null }[];
}

export interface ActionContext {
  session: Session | null;
  user: AuthenticatedUser;
  tenantId: string;
  currentWorkspaceId: string | null;
  permissions: string[];
  db: ReturnType<typeof getSecuredPrisma>;
}

export type ActionResponse<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

export async function protectedAction<T>(
  action: (context: ActionContext) => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const session = (await getServerSession(authOptions as any)) as Session | null;

    if (!session || !session.user) {
      throw new Error("UNAUTHORIZED");
    }

    const user = session.user as any;
    const tenantId = user.tenantId || "mercan"; // Fallback for edge cases
    const currentWorkspaceId = user.currentWorkspaceId || null;
    const permissions = user.permissions || [];

    const db = getSecuredPrisma(tenantId);

    const result = await action({ 
      session, 
      user, 
      tenantId, 
      currentWorkspaceId,
      permissions,
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
