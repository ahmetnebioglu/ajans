import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getBilsoftStokKartlari } from "@/src/services/bilsoft";
import StokTable from "./StokTable";
import type { Session } from "next-auth";

export default async function StoklarPage({
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

  const { data: stoklar, totalCount } = await getBilsoftStokKartlari(q, currentPage, 50);

  // KRİTİK: Veriyi sterilize et (Server -> Client geçişi için)
  const safeStoklar = JSON.parse(JSON.stringify(stoklar));

  return (
    <div className="p-6">
      <StokTable
        initialData={safeStoklar}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  );
}
