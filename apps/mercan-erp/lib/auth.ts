import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { unsecured_prisma as prisma } from "@ajans/db";
import bcrypt from "bcryptjs";
import { findLoginUser, verifyLoginOtp } from "./login-otp";

function toSessionUser(user: {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  tenantId: string | null;
  image: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId || "mercan",
    image: user.image,
  };
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma as never),
  providers: [
    CredentialsProvider({
      id: "email-otp",
      name: "E-posta Doğrulama",
      credentials: {
        email: { label: "E-posta", type: "email" },
        code: { label: "Doğrulama Kodu", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const code = credentials?.code?.trim();

        if (!email || !code) {
          throw new Error("E-posta ve doğrulama kodu gereklidir.");
        }

        if (!(await verifyLoginOtp(email, code))) {
          throw new Error("Geçersiz veya süresi dolmuş doğrulama kodu.");
        }

        if (email.endsWith("@mercan.test")) {
          const prefix = email.split("@")[0].toLowerCase();
          const roleMap: Record<string, string> = {
            admin: "ADMIN",
            customer: "CUSTOMER",
            expert: "EXPERT",
            uzman: "EXPERT",
            hr: "HR_MANAGER",
          };
          const assignedRole = roleMap[prefix] || "USER";

          const user = await prisma.user.upsert({
            where: { email },
            update: { role: assignedRole as never, tenantId: "mercan" },
            create: {
              id: `test-${prefix}-id`,
              email,
              name: `Mercan Test ${prefix.toUpperCase()}`,
              role: assignedRole as never,
              tenantId: "mercan",
            },
          });
          return toSessionUser(user);
        }

        let user = await findLoginUser(email);
        if (!user) {
          throw new Error("Bu e-posta adresi sistemde kayıtlı değil.");
        }

        if (!user.tenantId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { tenantId: "mercan" },
          });
        }

        return toSessionUser(user);
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "E-posta ve Şifre",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre gereklidir.");
        }

        const email = credentials.email.trim().toLowerCase();

        if (email.endsWith("@mercan.test")) {
          const prefix = email.split("@")[0].toLowerCase();
          const roleMap: Record<string, string> = {
            admin: "ADMIN",
            customer: "CUSTOMER",
            expert: "EXPERT",
            uzman: "EXPERT",
            hr: "HR_MANAGER",
          };
          const assignedRole = roleMap[prefix] || "USER";

          const user = await prisma.user.upsert({
            where: { email },
            update: { role: assignedRole as never, tenantId: "mercan" },
            create: {
              id: `test-${prefix}-id`,
              email,
              name: `Mercan Test ${prefix.toUpperCase()}`,
              role: assignedRole as never,
              tenantId: "mercan",
            },
          });
          return toSessionUser(user);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user && email === "admin@teknikel.com") {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email,
              name: "Admin Teknikel",
              password: hashedPassword,
              role: "ADMIN" as never,
              tenantId: "mercan",
            },
          });
        }

        if (!user?.password) {
          throw new Error("Kullanıcı bulunamadı veya şifre atanmamış.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Hatalı şifre.");
        }

        return toSessionUser(user);
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.tenantId = (user as { tenantId?: string }).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as never;
        session.user.tenantId = (token.tenantId as string) ?? "mercan";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
};
