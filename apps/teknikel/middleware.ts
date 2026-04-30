import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 1. NextAuth'un kendi çözücüsünü dene
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // 2. Vercel'in ve lokal ortamın oluşturduğu fiziksel çerezleri manuel kontrol et (Balyoz yöntemi)
  const hasSessionCookie = req.cookies.has("next-auth.session-token") || req.cookies.has("__Secure-next-auth.session-token");
  
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');

  // Hem token çözülemediyse hem de fiziksel çerez yoksa logine at
  if (!token && !hasSessionCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Bilet varsa ve logine girmeye çalışıyorsa ana sayfaya yolla
  if ((token || hasSessionCookie) && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
