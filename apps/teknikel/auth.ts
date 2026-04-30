import { authOptions as commonAuthOptions } from "@ajans/auth";

export const authOptions = {
  ...commonAuthOptions,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};
