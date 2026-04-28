import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Korumalı yollar (root dahil tüm ana sayfalar)
  const protectedRoutes = ["/", "/leads", "/vip", "/settings", "/sessions"];
  
  // Giriş sayfası kontrolü
  const isAuthPage = pathname === "/login";
  
  // Kullanıcı oturum çerezi var mı?
  // Not: Hem geçici 'auth_session' çerezini hem de next-auth'un standart çerezini kontrol ediyoruz
  const hasSession = 
    request.cookies.has("auth_session") || 
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  // Eğer kullanıcı giriş yapmamışsa ve korumalı bir sayfaya gitmeye çalışıyorsa
  if (!hasSession && protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Not: Kullanıcı giriş yapmış olsa bile login sayfasına gidebilmeli (tekrar giriş veya oturum tazeleme için)
  // Bu nedenle 'hasSession && isAuthPage' yönlendirmesini kaldırıyoruz.

  return NextResponse.next();
}

// Middleware'in çalışacağı yolları filtrele
export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar HARİÇ tüm istekleri yakala:
     * - api (API rotaları)
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyon dosyaları)
     * - favicon.ico (favicon dosyası)
     * - public klasörü içindeki dosyalar
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)",
  ],
};
