import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const allRawCookies = cookieStore.getAll();

  return (
    <div style={{ padding: "50px", backgroundColor: "#111", color: "#0f0", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1>🛠️ RADAR EKRANI: RÖNTGEN (X-RAY) MODU</h1>
      
      <h2 style={{ color: "#fff", marginTop: "30px" }}>1. NextAuth'un Gördüğü Bilet (Session):</h2>
      <pre style={{ background: "#222", padding: "15px", borderRadius: "8px", fontSize: "16px" }}>
        {JSON.stringify(session, null, 2)}
      </pre>
      
      <h2 style={{ color: "#ffeb3b", marginTop: "30px" }}>2. Sunucuya Gelen HAM Çerezler (Raw Cookies):</h2>
      <pre style={{ background: "#222", padding: "15px", borderRadius: "8px", fontSize: "16px", color: "#ffeb3b" }}>
        {JSON.stringify(allRawCookies, null, 2)}
      </pre>
    </div>
  );
}
