import { NextAuthOptions } from "next-auth";
import { authOptions as commonAuthOptions } from "@ajans/auth";

export const authOptions: NextAuthOptions = {
  ...commonAuthOptions,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
