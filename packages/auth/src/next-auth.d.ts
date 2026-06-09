import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

export type GlobalRole = "USER" | "SUPER_ADMIN" | "SYSTEM_SUPPORT";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: GlobalRole;
      tenantId: string | null;
      currentWorkspaceId: string | null;
      permissions: string[];
      availableWorkspaces: { id: string; name: string; roleId: string | null }[];
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
    currentWorkspaceId: string | null;
    permissions: string[];
    availableWorkspaces: { id: string; name: string; roleId: string | null }[];
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: GlobalRole;
    tenantId: string | null;
  }
}
