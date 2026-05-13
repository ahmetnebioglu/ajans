import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftFaturalar } from "@/src/services/bilsoft";
import FaturaTable from "./FaturaTable";

export default async function FaturalarPage({
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

  const { data: faturalar, totalCount } = await getBilsoftFaturalar(q, currentPage, 50);

  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeFaturalar = JSON.parse(JSON.stringify(faturalar));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Faturalar (Bilsoft)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bilsoft Ön Muhasebe sistemindeki güncel fatura listesi
        </p>
      </div>

      <FaturaTable
        initialData={safeFaturalar}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  );
}
