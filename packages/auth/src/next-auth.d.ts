import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

export type UserRole = "ADMIN" | "USER" | "EXPERT" | "CLIENT" | "HR_MANAGER" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tenantId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    tenantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    tenantId: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: UserRole;
    tenantId: string | null;
  }
}
