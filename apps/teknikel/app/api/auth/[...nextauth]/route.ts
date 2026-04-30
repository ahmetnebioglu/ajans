// 1. Vercel'e bu rotayı statik derlememesini, her istekte dinamik çalışmasını emrediyoruz.
// Bu sayede ESM/CJS derleme çakışması (require hatası) tamamen önlenir.
export const dynamic = "force-dynamic";

import NextAuth from "next-auth";
import { authOptions } from "@ajans/auth";

const handler = NextAuth(authOptions);

// 2. Export as syntax'ı yerine doğrudan değişken ataması yapıyoruz.
// Turbopack bazen 'export { handler as GET }' sözdizimini dış paketlerde yanlış yorumlayabiliyor.
export const GET = handler;
export const POST = handler;
