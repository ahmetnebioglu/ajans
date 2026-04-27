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
      allowDangerousEmailAccountLinking: true,
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
            const prefix = credentials.email.split('@')[0].toLowerCase();
            const roleMap: Record<string, string> = {
              admin: "ADMIN",
              customer: "CUSTOMER",
              expert: "EXPERT",
              uzman: "EXPERT",
              hr: "HR_MANAGER"
            };
            const assignedRole = roleMap[prefix] || "USER";
            
            // Veritabanında bu test kullanıcısının var olduğundan emin ol (FK hatalarını önlemek için)
            const testUser = await prisma.user.upsert({
              where: { email: credentials.email },
              update: { 
                role: assignedRole as any,
                tenantId: "mercan"
              },
              create: {
                id: `test-${prefix}-id`,
                email: credentials.email,
                name: `Mercan Test ${prefix.toUpperCase()}`,
                role: assignedRole as any,
                tenantId: "mercan",
              }
            });

            return testUser;
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
    async signIn({ user, account, profile }) {
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.tenantId = (user as any).tenantId || "mercan";
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
    async redirect({ url, baseUrl }) {
      // url contains the callbackUrl
      // But we need the role. NextAuth redirect callback doesn't have easy access to session.
      // Usually, redirection is handled in the middleware or login page.
      // But if we want to force it here based on some logic:
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
};
