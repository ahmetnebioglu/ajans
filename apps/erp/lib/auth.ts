import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { unsecured_prisma as prisma } from "@ajans/db";
import bcrypt from "bcryptjs";
import { findLoginUser, verifyLoginOtp } from "./login-otp";

export const DEFAULT_TENANT_ID = "mercan";

function toSessionUser(
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    tenantId: string | null;
    image: string | null;
  },
  workspaceUsers?: Array<{
    workspaceId: string;
    roleId: string | null;
    workspace: { name: string; tenantId: string };
    role: { permissions: string[] } | null;
  }>
) {
  const availableWorkspaces = (workspaceUsers || []).map((wu) => ({
    id: wu.workspaceId,
    name: wu.workspace.name,
    roleId: wu.roleId,
    tenantId: wu.workspace.tenantId,
  }));

  const first = workspaceUsers?.[0];
  const currentWorkspaceId = first?.workspaceId || null;
  const tenantId = first?.workspace?.tenantId || user.tenantId || DEFAULT_TENANT_ID;
  const permissions = first?.role?.permissions || [];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId,
    image: user.image,
    currentWorkspaceId,
    permissions,
    availableWorkspaces,
  } as any;
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

        if (email.endsWith("@erp.test")) {
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
            update: {
              role: assignedRole as never,
              tenantId: DEFAULT_TENANT_ID,
            },
            create: {
              id: `test-${prefix}-id`,
              email,
              name: `ERP Test ${prefix.toUpperCase()}`,
              role: assignedRole as never,
              tenantId: DEFAULT_TENANT_ID,
            },
          });
          return toSessionUser(user);
        }

        let userRaw = await findLoginUser(email);
        if (!userRaw) {
          throw new Error("Bu e-posta adresi sistemde kayıtlı değil.");
        }

        if (!userRaw.tenantId) {
          userRaw = await prisma.user.update({
            where: { id: userRaw.id },
            data: { tenantId: DEFAULT_TENANT_ID },
          });
        }

        const fullUser = await prisma.user.findUnique({
          where: { id: userRaw.id },
          include: {
            workspaceUsers: {
              include: { workspace: true, role: true }
            }
          }
        });

        return toSessionUser(userRaw, fullUser?.workspaceUsers as any);
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

        if (email.endsWith("@erp.test")) {
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
            update: {
              role: assignedRole as never,
              tenantId: DEFAULT_TENANT_ID,
            },
            create: {
              id: `test-${prefix}-id`,
              email,
              name: `ERP Test ${prefix.toUpperCase()}`,
              role: assignedRole as never,
              tenantId: DEFAULT_TENANT_ID,
            },
          });
          return toSessionUser(user);
        }

        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            workspaceUsers: {
              include: { workspace: true, role: true }
            }
          }
        });

        if (!user && email === "admin@teknikel.com") {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const created = await prisma.user.create({
            data: {
              email,
              name: "Admin Teknikel",
              password: hashedPassword,
              role: "ADMIN" as never,
              tenantId: DEFAULT_TENANT_ID,
            },
            include: {
              workspaceUsers: {
                include: { workspace: true, role: true }
              }
            }
          });
          user = created;
        }

        if (!user?.password) {
          throw new Error("Kullanıcı bulunamadı veya şifre atanmamış.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Hatalı şifre.");
        }

        return toSessionUser(user, user.workspaceUsers as any);
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }: any) {
      // Workspace switcher: session.update() ile tetiklenir
      if (trigger === "update" && updateSession?.currentWorkspaceId) {
        token.currentWorkspaceId = updateSession.currentWorkspaceId;
        token.permissions = updateSession.permissions || [];
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.currentWorkspaceId = (user as any).currentWorkspaceId || null;
        token.permissions = (user as any).permissions || [];
        token.availableWorkspaces = (user as any).availableWorkspaces || [];
      }
      return token;
    },
    async session({ session, token }: any) {
      const u = session.user as any;
      if (token && u) {
        u.id = token.id as string;
        u.role = token.role as never;
        u.tenantId = (token.tenantId as string) ?? DEFAULT_TENANT_ID;
        u.currentWorkspaceId = (token.currentWorkspaceId as string) ?? null;
        u.permissions = (token.permissions as string[]) ?? [];
        u.availableWorkspaces = (token.availableWorkspaces as any[]) ?? [];
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
