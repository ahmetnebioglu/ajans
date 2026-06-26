import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftFaturalar } from "@/src/services/bilsoft";
import FaturaTable from "./FaturaTable";
import type { Session } from "next-auth";

export default async function FaturalarPage({
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

  const { data: faturalar, totalCount } = await getBilsoftFaturalar(q, currentPage, 50);

  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeFaturalar = JSON.parse(JSON.stringify(faturalar));

  return (
    <div className="p-6">
      <FaturaTable
        initialData={safeFaturalar}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  );
}
