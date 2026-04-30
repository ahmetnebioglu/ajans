import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Karantina Testi: @ajans/auth paketini bilerek import ETMİYORUZ.
// Sadece uygulamanın ayağa kalkıp kalkmadığını test edeceğiz.
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Test",
      credentials: {},
      async authorize() {
        return null;
      },
    }),
  ],
  secret: "gecici-test-sifresi-123",
});

export { handler as GET, handler as POST };
