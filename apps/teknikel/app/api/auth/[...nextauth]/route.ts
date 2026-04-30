import NextAuth from "next-auth/next";
import { authOptions } from "@ajans/auth";

// Credentials stratejisinde adapter kullanımı token üretimini bozduğu için 
// Teknikel projesinde adapter devre dışı bırakıldı.
const handler = NextAuth({
  ...authOptions,
  adapter: undefined,
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
