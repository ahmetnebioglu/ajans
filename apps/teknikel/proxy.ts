import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/leads/:path*",
    "/vip/:path*",
    "/sessions/:path*",
    "/profile/:path*",
    "/api/((?!auth).*)"
  ],
};
