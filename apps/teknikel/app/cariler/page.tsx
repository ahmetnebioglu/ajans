import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftCariler } from "@/src/services/bilsoft";
import CariTable from "./CariTable";
import type { Session } from "next-auth";

export default async function CarilerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  // Veriyi çek (Arama ve Sayfalama ile birlikte)
  const { data: cariler, totalCount } = await getBilsoftCariler(q, currentPage, 1500);
  
  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeCariler = JSON.parse(JSON.stringify(cariler));

  return (
    <div className="p-6">
      <CariTable initialData={safeCariler} totalCount={totalCount} currentPage={currentPage} />
    </div>
  );
}
