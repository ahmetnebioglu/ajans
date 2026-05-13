import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getIdeasoftProducts } from "@/src/services/ideasoft";
import ProductGrid from "./ProductGrid";

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; s?: string }>;
}) {
  const { sort = "-id", page = "1", s = "" } = await searchParams;
  const currentPage = Number(page) || 1;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { data: products, totalCount, pagination } = await getIdeasoftProducts(
    sort,
    currentPage,
    30,
    s
  );

  // Veriyi sterilize et (Server -> Client geçişi için)
  const safeProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Ürünler (Ideasoft)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ideasoft üzerinden alınan ürün listesi
        </p>
      </div>

      <ProductGrid
        initialData={safeProducts}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        searchTerm={s}
        sort={sort}
      />
    </div>
  );
}
