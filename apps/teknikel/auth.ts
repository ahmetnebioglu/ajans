import { authOptions as commonAuthOptions } from "@ajans/auth";

export const authOptions = {
  ...commonAuthOptions,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: undefined,
  session: {
    strategy: "jwt" as const,
  },
};
