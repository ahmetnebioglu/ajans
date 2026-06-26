import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getIdeasoftCustomers } from "@/src/services/ideasoft";
import CustomerTable from "./CustomerTable";
import type { Session } from "next-auth";

export default async function MusterilerPage({
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
      <CustomerTable
        initialData={safeCustomers}
        totalCount={safeCustomers.length}
        currentPage={currentPage}
        error={error}
      />
    </div>
  );
}
