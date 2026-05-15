import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getIdeasoftCustomers } from "@/src/services/ideasoft";
import { revalidateMusteriler } from "@/app/actions/revalidate";
import { CacheRevalidateButton } from "@/app/components/CacheRevalidateButton";
import CustomerTable from "./CustomerTable";

export default async function MusterilerPage({
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

  let customers: any[] = [];
  let error: string | null = null;

  try {
    customers = await getIdeasoftCustomers();
  } catch (err: any) {
    console.error("Müşteriler sayfası - IdeaSoft API hatası:", err);
    error = err?.message || "IdeaSoft bağlantı hatası";
  }

  // Veriyi sterilize et (Server -> Client geçişi için)
  const safeCustomers = JSON.parse(JSON.stringify(customers));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Müşteriler (Ideasoft)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ideasoft üzerinden alınan müşteri listesi
          </p>
        </div>
        <CacheRevalidateButton onRevalidate={revalidateMusteriler} label="Müşteriler Önbelleğini Yenile" />
      </div>

      <CustomerTable
        initialData={safeCustomers}
        totalCount={safeCustomers.length}
        currentPage={currentPage}
        error={error}
      />
    </div>
  );
}
