import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../auth";
import { unsecured_prisma as db } from "@ajans/db";
import UserTable from "./UserTable";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  // Yetki Kontrolü: Sadece ADMIN'ler girebilir
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  // Kullanıcıları çek (Şifre hariç)
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UserTable users={users as any} />
    </div>
  );
}
