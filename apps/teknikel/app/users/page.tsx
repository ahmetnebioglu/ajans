import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; 
import { unsecured_prisma as db } from "@ajans/db"; 
import { redirect } from "next/navigation";
import UserTable from "./UserTable";
import type { Session } from "next-auth";

// NEXT.JS'E EMİR: Bu sayfayı asla önbelleğe alma, her girişte canlı veri çek!
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = (await getServerSession(authOptions)) as Session | null;

  // Admin değilse dışarı at
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  // Prisma'dan veriyi çekiyoruz
  const users = await db.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Prisma'dan gelen veriyi (tarihler ve gizli fonksiyonlar dahil) %100 saf JSON'a çeviriyoruz
  const safeUsers = JSON.parse(JSON.stringify(users));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Kullanıcı Yönetimi</h1>
      <UserTable data={safeUsers} />
    </div>
  );
}
