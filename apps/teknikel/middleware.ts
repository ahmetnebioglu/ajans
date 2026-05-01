import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Gelen istekteki NextAuth biletini (token) oku
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Kullanıcı giriş yapmamışsa ve login ekranında değilse, dışarı at
  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // API rotaları ve Next.js statik dosyaları HARİÇ tüm sayfalarda bu dosyayı çalıştır
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
