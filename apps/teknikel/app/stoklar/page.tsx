import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftStokKartlari } from "@/src/services/bilsoft";
import StokTable from "./StokTable";

export default async function StoklarPage({
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

  const { data: stoklar, totalCount } = await getBilsoftStokKartlari(q, currentPage, 50);

  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeStoklar = JSON.parse(JSON.stringify(stoklar));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Stok Kartları (Bilsoft)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bilsoft Ön Muhasebe sistemindeki güncel stok kartı listesi
        </p>
      </div>

      <StokTable
        initialData={safeStoklar}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  );
}
