import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Gelen tüm çerezleri al ve isminde "session-token" geçen HERHANGİ BİR çerez var mı bak.
  // Bu yöntem Vercel'in __Secure ön eklerini ve .0 / .1 gibi parçalanmış çerezlerini (chunking) %100 yakalar.
  const cookies = req.cookies.getAll();
  const hasSession = cookies.some(c => c.name.includes("session-token"));
  
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');

  // Çerez yoksa ve loginde değilse, logine at
  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Çerez varsa ve logine girmeye çalışıyorsa, ana sayfaya al
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
