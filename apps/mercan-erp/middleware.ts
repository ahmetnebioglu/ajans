import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const url = req.nextUrl.pathname;

    // ROLE-BASED ACCESS CONTROL (RBAC) LOGIC
    
    // 1. İdari Sayfalar (Login, Yönetim vb.) sadece ADMIN içindir
    if (url.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Sistem Günlükleri sadece ADMIN içindir
    if (url.startsWith("/dashboard/logs") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { 
  matcher: ["/dashboard/:path*"] 
};
