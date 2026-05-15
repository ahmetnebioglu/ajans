import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getIdeasoftOrders } from "@/src/services/ideasoft";
import { revalidateSiparisler } from "@/app/actions/revalidate";
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
    <>
      <OrderTable
        initialData={safeOrders}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        statusFilter={status}
        sort={sort}
        error={error}
        onRevalidate={revalidateSiparisler}
      />
    </>
  );
}
