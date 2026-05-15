import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getIdeasoftOrders } from "@/src/services/ideasoft";
import { revalidateSiparisler } from "@/app/actions/revalidate";
import { CacheRevalidateButton } from "@/app/components/CacheRevalidateButton";
import OrderTable from "./OrderTable";

export default async function SiparislerPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; status?: string }>;
}) {
  const { sort = "-id", page = "1", status = "" } = await searchParams;
  const currentPage = Number(page) || 1;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let orders: any[] = [];
  let totalCount = 0;
  let pagination = { totalPages: 0 };
  let error: string | null = null;

  try {
    const result = await getIdeasoftOrders(sort, currentPage, 50, status);
    orders = result.data;
    totalCount = result.totalCount;
    pagination = result.pagination;
  } catch (err: any) {
    console.error("Siparisler sayfası - IdeaSoft API hatası:", err);
    error = err?.message || "IdeaSoft bağlantı hatası";
  }

  // Veriyi sterilize et (Server -> Client geçişi için)
  const safeOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Siparisler (Ideasoft)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ideasoft üzerinden alınan sipariş listesi
          </p>
        </div>
        <CacheRevalidateButton onRevalidate={revalidateSiparisler} label="Siparisler Önbelleğini Yenile" />
      </div>
      <OrderTable
        initialData={safeOrders}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        statusFilter={status}
        sort={sort}
        error={error}
      />
    </div>
  );
}
