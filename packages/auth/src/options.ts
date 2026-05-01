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
          const roleMap: Record<string, string> = {
            admin: "ADMIN",
            customer: "CUSTOMER",
            expert: "EXPERT",
            uzman: "EXPERT",
            hr: "HR_MANAGER"
          };
          const assignedRole = roleMap[prefix] || "USER";
          
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
          where: { email: credentials.email }
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
              role: "ADMIN" as any,
              tenantId: "mercan",
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

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          image: user.image
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt',
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
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.tenantId = (user as any).tenantId || "mercan";
        token.picture = user.image;
        token.name = user.name;
      }

      // MANUEL SESSION TRACKING (For "Oturum Yönetimi" Page)
      if (!token.sessionToken && token.id) {
        try {
          const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          await prisma.$transaction(async (tx) => {
            await tx.session.create({
              data: {
                sessionToken,
                userId: token.id as string,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              }
            });
          });

          token.sessionToken = sessionToken;
        } catch (e) {
          console.error("Session creation error:", e);
        }
      }

      // Frontend update() tetiklendiğinde token'ı zorla güncelle
      if (trigger === "update" && session) {
        token.picture = session.image ?? session.user?.image ?? token.picture;
        token.name = session.name ?? session.user?.name ?? token.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Çerezlere güvenmek yerine doğrudan veritabanındaki en güncel halini al (DB-First)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { 
              id: true, 
              image: true, 
              name: true, 
              role: true, 
              tenantId: true 
            }
          });

          if (dbUser) {
            (session.user as any).id = dbUser.id;
            (session.user as any).role = dbUser.role;
            (session.user as any).tenantId = dbUser.tenantId;
            session.user.image = dbUser.image;
            session.user.name = dbUser.name;
          } else {
            // Veritabanında bulunamazsa token'daki verileri kullan (fallback)
            (session.user as any).id = token.id;
            (session.user as any).role = token.role;
            (session.user as any).tenantId = token.tenantId;
            if (token.picture) session.user.image = token.picture as string;
            if (token.name) session.user.name = token.name as string;
          }
        } catch (e) {
          console.error("[SessionCallback] DB fetch error:", e);
        }
      }
      
      // Session token bilgisini her durumda ekle
      if (token.sessionToken) {
        (session.user as any).sessionToken = token.sessionToken;
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
