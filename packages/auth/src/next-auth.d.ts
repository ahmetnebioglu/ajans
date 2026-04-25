import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    tenantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: string;
    tenantId: string | null;
  }
}
