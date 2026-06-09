import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getIdeasoftProducts } from "@/src/services/ideasoft";
import { revalidateUrunler } from "@/app/actions/revalidate";
import { CacheRevalidateButton } from "@/app/components/CacheRevalidateButton";
import ProductGrid from "./ProductGrid";
import type { Session } from "next-auth";

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string; s?: string }>;
}) {
  const { sort = "-id", page = "1", s = "" } = await searchParams;
  const currentPage = Number(page) || 1;
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session) {
    redirect("/login");
  }

  let products: any[] = [];
  let totalCount = 0;
  let pagination = { totalPages: 0 };
  let error: string | null = null;

  try {
    const result = await getIdeasoftProducts(sort, currentPage, 30, s);
    products = result.data;
    totalCount = result.totalCount;
    pagination = result.pagination;
  } catch (err: any) {
    console.error("Ürünler sayfası - IdeaSoft API hatası:", err);
    error = err?.message || "IdeaSoft bağlantı hatası";
  }

  // Veriyi sterilize et (Server -> Client geçişi için)
  const safeProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Ürünler (Ideasoft)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ideasoft üzerinden alınan ürün listesi
          </p>
        </div>
        <CacheRevalidateButton onRevalidate={revalidateUrunler} label="Ürünler Önbelleğini Yenile" />
      </div>

      <ProductGrid
        initialData={safeProducts}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        searchTerm={s}
        sort={sort}
        error={error}
      />
    </div>
  );
}
