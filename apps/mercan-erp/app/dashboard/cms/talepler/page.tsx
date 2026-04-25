import React from "react";
import { prisma as db } from "@/lib/db";
import { MessageSquare, FileText, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import RequestsClient from "./RequestsClient";

export default async function UnifiedRequestsPage() {
  // Prerender hatasını önlemek için request verisine erişim (Dynamic Route)
  await headers();
  
  const contactRequests = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const referenceRequests = await db.referenceRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Gelen <span className="text-emerald-600">Talepler</span></h1>
          <p className="text-slate-500 font-medium italic">Web sitesi üzerinden iletilen tüm mesaj ve referans istekleri.</p>
        </div>
        <Link
          href="/dashboard/crm"
          className="relative px-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px] rounded-[4px] shadow-lg shadow-emerald-600/40 hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-3 group italic overflow-hidden"
        >
          {/* Glowing Aura Effect */}
          <div className="absolute inset-0 bg-emerald-500/20 animate-pulse rounded-[4px]" />
          <div className="absolute -inset-1 bg-emerald-400/20 blur-md animate-pulse opacity-50" />
          
          <Users size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
          <span className="relative z-10">CRM PANELİNE GİT</span>
          <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Client Component with Tabs */}
      <RequestsClient 
        contactRequests={contactRequests} 
        referenceRequests={referenceRequests} 
      />
    </div>
  );
}

