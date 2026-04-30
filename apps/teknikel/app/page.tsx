import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ padding: "50px", backgroundColor: "#111", color: "#0f0", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1>🛠️ RADAR EKRANI: KAPI DEVRE DIŞI</h1>
      <h2>Cebimizdeki Bilet (Session):</h2>
      <pre style={{ fontSize: "16px", background: "#222", padding: "20px", borderRadius: "8px" }}>
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
