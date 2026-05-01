export { default } from "next-auth/middleware";

export const config = {
  // login, api rotaları ve statik dosyalar HARİÇ tüm sayfaları korumaya al
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
