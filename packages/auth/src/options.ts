import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { unsecured_prisma as prisma } from "@ajans/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(process.env.NODE_ENV !== "production" ? [
      CredentialsProvider({
        id: "credentials",
        name: "VIP Test Pass",
        credentials: {
          email: { label: "E-posta", type: "email" },
          password: { label: "Şifre", type: "password" },
          role: { label: "Role", type: "text" },
          tenantId: { label: "Tenant ID", type: "text" }
        },
        async authorize(credentials) {
          if (!credentials?.email) return null;

          // VIP Pass for E2E Tests: Guaranteed user object for test emails
          if (credentials.email.endsWith("@mercan.test")) {
            const rolePrefix = credentials.email.split('@')[0].toUpperCase();
            const assignedRole = rolePrefix === 'ADMIN' ? 'ADMIN' : 'USER';
            
            return {
              id: `test-${rolePrefix.toLowerCase()}-id`,
              name: `Mercan Test ${rolePrefix}`,
              email: credentials.email,
              role: assignedRole,
              tenantId: "mercan",
            } as any;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          return user ? user : null;
        }
      })
    ] : [])
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_COOKIE_NAME || `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        ...(process.env.NODE_ENV === 'production' ? { domain: '.mercanerp.com' } : {})
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      if (user && (user as any).role === "USER") {
        return "/unauthorized";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
