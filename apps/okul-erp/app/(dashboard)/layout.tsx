import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.tenantId !== "okul") {
    redirect("/login?error=TenantMismatch");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 h-14 flex items-center px-6 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-[2px] flex items-center justify-center text-white font-black italic text-lg shadow-lg">O</div>
          <h1 className="text-sm font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">OKUL <span className="text-blue-600">ERP</span> / YÖNETİM</h1>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
