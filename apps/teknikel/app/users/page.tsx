import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; 
import { unsecured_prisma as db } from "@ajans/db"; 
import { redirect } from "next/navigation";
import UserTable from "./UserTable";

// NEXT.JS'E EMİR: Bu sayfayı asla önbelleğe alma, her girişte canlı veri çek!
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  // Admin değilse dışarı at
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  // Prisma'dan sadece güvenli string verilerini (Select) çekiyoruz, gereksiz Date objelerini hiç almıyoruz.
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Son güvenlik katmanı: Date'i string'e zorla
  const safeUsers = users.map((u) => ({
    id: u.id,
    name: u.name || "İsimsiz Kullanıcı",
    email: u.email,
    role: u.role || "USER",
    createdAt: u.createdAt ? u.createdAt.toISOString() : null,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Kullanıcı Yönetimi</h1>
      <UserTable data={safeUsers as any} />
    </div>
  );
}
