import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftCariler } from "@/src/services/bilsoft";
import CariTable from "./CariTable";

export default async function CarilerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Veriyi çek (Arama parametresi ile birlikte)
  const carilerData = await getBilsoftCariler(q);
  
  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeCariler = JSON.parse(JSON.stringify(carilerData));

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
      
      <CariTable initialData={safeCariler} />
    </div>
  );
}
