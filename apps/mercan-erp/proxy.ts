import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const cookieName = process.env.NEXTAUTH_COOKIE_NAME || "next-auth.session-token";
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName
  });
  const url = req.nextUrl.pathname;

  // Login sayfası hariç tüm /dashboard yolları token gerektirir
  if (!token && url.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Kiracı (Tenant) Doğrulaması
  if (token && url.startsWith("/dashboard") && token.tenantId !== "mercan") {
    return NextResponse.redirect(new URL("/login?error=TenantMismatch", req.url));
  }

  // ROLE-BASED ACCESS CONTROL (RBAC) LOGIC
  
  // 1. İdari Sayfalar (Yönetim vb.) sadece ADMIN içindir
  if (url.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Sistem Günlükleri sadece ADMIN içindir
  if (url.startsWith("/dashboard/logs") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = { 
  matcher: ["/dashboard/:path*"] 
};
