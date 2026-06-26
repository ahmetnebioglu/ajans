import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { unsecured_prisma as db } from '@ajans/db';
import RaporClient from "./RaporClient";
import type { Session } from "next-auth";

export default async function CarilerRaporPage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session) redirect("/login");

  // Fetch all cariler from Prisma cache (which is synced by our background cron job)
  const cachedCariler = await db.bilsoftCariCache.findMany({
    orderBy: {
      faturaUnvan: 'asc'
    }
  });

  // Process data for the Client Component
  const reportData = cachedCariler.map(cari => {
    let monthsSinceLastInvoice = null;

    if (cari.lastInvoiceDate) {
      const now = new Date();
      const invoiceDate = new Date(cari.lastInvoiceDate);
      
      // Calculate months difference roughly
      const yearsDiff = now.getFullYear() - invoiceDate.getFullYear();
      const monthsDiff = now.getMonth() - invoiceDate.getMonth();
      monthsSinceLastInvoice = (yearsDiff * 12) + monthsDiff;
      
      if (monthsSinceLastInvoice < 0) monthsSinceLastInvoice = 0;
    }

    return {
      id: cari.id,
      cariKod: cari.cariKod || "",
      faturaUnvan: cari.faturaUnvan,
      yetkili: cari.yetkili,
      cep: cari.cep,
      tel: cari.tel,
      mail: cari.mail,
      lastInvoiceDate: cari.lastInvoiceDate ? cari.lastInvoiceDate.toISOString() : null,
      monthsSinceLastInvoice,
    };
  });
  
  const safeData = JSON.parse(JSON.stringify(reportData));

  return (
    <div className="p-6">
      <RaporClient initialData={safeData} />
    </div>
  );
}
