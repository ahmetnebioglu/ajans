import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { unsecured_prisma as prisma } from "@ajans/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "E-posta ve Şifre",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        console.log("Login Denemesi:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre gereklidir.");
        }

        // VIP Pass for E2E Tests
        if (credentials.email.endsWith("@mercan.test")) {
          const prefix = credentials.email.split('@')[0].toLowerCase();
          const assignedRole = "USER";
          
          return await prisma.$transaction(async (tx) => {
            return await tx.user.upsert({
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
          });
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            workspaceUsers: {
              include: {
                workspace: true,
                role: true
              }
            }
          }
        });

        // AUTO-SEED MANTIĞI: Admin kullanıcısı yoksa anında oluştur
        if (!user && credentials.email === "admin@teknikel.com") {
          console.log("Auto-Seed: Admin kullanıcısı oluşturuluyor...");
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: "Admin Teknikel",
              password: hashedPassword,
              role: "SUPER_ADMIN" as any,
              tenantId: "mercan",
            },
            include: {
              workspaceUsers: {
                include: { workspace: true, role: true }
              }
            }
          });
        }

        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı veya şifre atanmamış.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Hatalı şifre.");
        }

        const availableWorkspaces = user.workspaceUsers.map((wu: any) => ({
          id: wu.workspaceId,
          name: wu.workspace.name,
          roleId: wu.roleId,
          tenantId: wu.workspace.tenantId
        }));

        const currentWorkspace = user.workspaceUsers[0];
        const currentWorkspaceId = currentWorkspace?.workspaceId || null;
        const tenantId = currentWorkspace?.workspace?.tenantId || user.tenantId;
        const permissions = currentWorkspace?.role?.permissions || [];

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId,
          currentWorkspaceId,
          permissions,
          availableWorkspaces,
          image: user.image
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Allow updating session (e.g. Workspace Switch)
      if (trigger === "update" && session?.currentWorkspaceId) {
        token.currentWorkspaceId = session.currentWorkspaceId;
        token.permissions = session.permissions || [];
      }

      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.currentWorkspaceId = (user as any).currentWorkspaceId;
        token.permissions = (user as any).permissions;
        token.availableWorkspaces = (user as any).availableWorkspaces;
      }
      return token;
    },
    async session({ session, token }) {
      const user = session.user as any;
      if (token && user) {
        user.id = token.id as string;
        user.role = token.role as any;
        user.tenantId = token.tenantId as string | null;
        user.currentWorkspaceId = token.currentWorkspaceId as string | null;
        user.permissions = token.permissions as string[];
        user.availableWorkspaces = token.availableWorkspaces as any;
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
