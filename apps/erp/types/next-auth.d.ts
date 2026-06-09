import { DefaultSession } from "next-auth";

export type GlobalRole = "USER" | "SUPER_ADMIN" | "SYSTEM_SUPPORT" | "ADMIN" | "EXPERT" | "CLIENT" | "HR_MANAGER" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: GlobalRole;
      tenantId: string;
      currentWorkspaceId: string | null;
      permissions: string[];
      availableWorkspaces: { id: string; name: string; roleId: string | null; tenantId?: string }[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: GlobalRole;
    tenantId: string | null;
    currentWorkspaceId?: string | null;
    permissions?: string[];
    availableWorkspaces?: { id: string; name: string; roleId: string | null }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: GlobalRole;
    tenantId: string | null;
    currentWorkspaceId?: string | null;
    permissions?: string[];
    availableWorkspaces?: { id: string; name: string; roleId: string | null }[];
  }
}
