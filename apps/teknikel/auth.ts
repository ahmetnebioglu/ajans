import { authOptions as commonAuthOptions } from "@ajans/auth";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
    } & Session["user"];
  }
}

export const authOptions = {
  ...commonAuthOptions,
  secret: process.env.NEXTAUTH_SECRET || "teknikel-kombi-super-gizli-sifre-2026-asdf",

  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    }
  },
} as const;
