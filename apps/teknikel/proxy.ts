import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Durum: Bilet YOK ve login sayfasında DEĞİL -> Login'e at
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Durum: Bilet VAR ve login sayfasına girmeye çalışıyor -> Ana sayfaya fırlat
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// EN KRİTİK KISIM: Proxy'nin çalışacağı rotaları sınırla
export const config = {
  // /api, /_next/static, /_next/image ve favicon HARİÇ tüm sayfalarda çalıştır
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
