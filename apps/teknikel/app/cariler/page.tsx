import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftCariler } from "@/src/services/bilsoft";
import CariTable from "./CariTable";

export default async function CarilerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Veriyi çek (Arama ve Sayfalama ile birlikte)
  const { data: cariler, totalCount } = await getBilsoftCariler(q, currentPage);
  
  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeCariler = JSON.parse(JSON.stringify(cariler));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Cariler (Bilsoft)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bilsoft Ön Muhasebe sistemindeki güncel cari listesi
        </p>
      </div>
      
      <CariTable initialData={safeCariler} totalCount={totalCount} currentPage={currentPage} />
    </div>
  );
}
