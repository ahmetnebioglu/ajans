export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Login, public API'ler, Next.js statik dosyaları ve imajlar hariç tüm sayfaları korur
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ],
};
