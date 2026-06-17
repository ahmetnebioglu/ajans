import React from "react";
import { getLeads } from "@ajans/core";
import CrmKanbanClient from "./crm-kanban-client";
import { LayoutGrid, Layers, Zap } from "lucide-react";

import { KanbanSkeleton } from "@ajans/ui";
import { Suspense } from "react";
import AiDashboard from "./ai-dashboard";

export const dynamic = "force-dynamic";

export default async function CRMPage() {
  // Session kontrolü layout'ta yapılıyor, burada tekrar yapılmıyor

  return (
    <div className="h-[calc(100vh-24px)] flex flex-col overflow-hidden px-4 gap-3 bg-white dark:bg-zinc-950">
      {/* ERP Header Style - STATIC PART (Pre-rendered) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-[4px] shadow-sm border border-slate-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-red-500 shadow-lg shrink-0 rounded-[4px]">
            <Layers size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Zap size={8} className="text-red-500 animate-pulse" />
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500">
                System / CRM / AI
              </span>
            </div>
            <h1 className="text-base font-black italic uppercase tracking-tighter text-slate-900 dark:text-zinc-100 flex items-center gap-3">
              Gelen <span className="text-red-600">Talepler</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-[7px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2 rounded-[4px] cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
            <LayoutGrid size={10} className="text-red-500" />
            PANEL
          </div>
          <div className="px-2.5 py-1.5 bg-red-600 text-white text-[7px] font-black uppercase tracking-widest flex items-center gap-2 rounded-[4px] hover:bg-red-500 transition-colors cursor-pointer shadow-md">
            YENİ LEAD
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {/* Kanban Container - DYNAMIC PART (Streamed) */}
        <div className="h-full overflow-hidden min-h-0">
          <Suspense fallback={<KanbanSkeleton />}>
            <KanbanLoader />
          </Suspense>
        </div>

        {/* AI PANEL (Floating UI) */}
        <AiDashboard />
      </div>
    </div>
  );
}

/**
 * Dinamik Veri Yükleyici (Streaming Component)
 */
async function KanbanLoader() {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@ajans/auth/options");

  const session: any = await getServerSession(authOptions as any);
  const tenantId = (session?.user as any)?.tenantId || "mercan";

  const leadsRes = await getLeads(tenantId);
  const leads = leadsRes.success ? leadsRes.data : [];

  return (
    <CrmKanbanClient
      initialLeads={JSON.parse(JSON.stringify(leads))}
      tenantId={tenantId}
      userId={session?.user?.id || "SYSTEM"}
    />
  );
}
