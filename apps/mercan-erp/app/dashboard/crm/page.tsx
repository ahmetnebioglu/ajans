import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
import { getLeads } from "@ajans/core";
import CrmKanbanClient from "./crm-kanban-client";
import { LayoutGrid, Layers, Zap } from "lucide-react";

import { KanbanSkeleton } from "@ajans/ui";
import { Suspense } from "react";
import AiDashboard from "./ai-dashboard";

export default async function CRMPage() {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden px-4 pb-4 gap-3 bg-zinc-950">
      {/* Mercan Header Style - STATIC PART (Pre-rendered) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900 p-3 rounded-none shadow-sm border border-zinc-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-black border border-zinc-800 flex items-center justify-center text-teal-400 shadow-lg shrink-0 rounded-none">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Zap size={8} className="text-teal-500 animate-pulse" />
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">System / CRM / AI</span>
            </div>
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-3">
              Gelen <span className="text-teal-500">Talepler</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 border border-zinc-800 bg-black text-[7px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 rounded-none cursor-pointer hover:bg-zinc-800 transition-all">
            <LayoutGrid size={10} className="text-teal-500" />
            PANEL
          </div>
          <div className="px-3 py-1.5 bg-teal-600 text-black text-[7px] font-black uppercase tracking-widest flex items-center gap-2 rounded-none hover:bg-teal-500 transition-colors cursor-pointer shadow-md">
            YENİ LEAD
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* AI PANEL (Gen UI) */}
        <div className="w-full xl:w-[400px] shrink-0">
          <AiDashboard />
        </div>

        {/* Kanban Container - DYNAMIC PART (Streamed) */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Suspense fallback={<KanbanSkeleton />}>
            <KanbanLoader />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * Dinamik Veri Yükleyici (Streaming Component)
 */
async function KanbanLoader() {
  const session = await getServerSession(authOptions);
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
