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
    ...(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" ? [
      CredentialsProvider({
        id: "credentials",
        name: "Test Girişi",
        credentials: {
          email: { label: "E-posta", type: "email" },
          password: { label: "Şifre", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email) return null;
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
    async jwt({ token, user }) {
      console.log(">>> [Auth:JWT] User:", user?.email);
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
      }
      console.log(">>> [Auth:JWT] Token:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      console.log(">>> [Auth:Session] Token:", token?.email);
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
      }
      console.log(">>> [Auth:Session] Session:", JSON.stringify(session, null, 2));
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
