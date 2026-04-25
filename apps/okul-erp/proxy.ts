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
  if (token && url.startsWith("/dashboard") && token.tenantId !== "okul") {
    return NextResponse.redirect(new URL("/login?error=TenantMismatch", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
