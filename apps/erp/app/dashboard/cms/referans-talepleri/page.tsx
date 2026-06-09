import React from "react";
import { prisma as db } from "@/lib/db";
import { User, Mail, Building2, Map, Calendar, ShieldCheck, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function ReferenceRequestsPage() {
  const requests = await db.referenceRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6 font-medium italic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Referans <span className="text-emerald-600">Talepleri</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sektörel referans listesi isteyen firmalar.</p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800">
             <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-800 mb-4" />
             <p className="text-slate-400 font-black uppercase italic tracking-widest text-[10px]">Henüz bir talep bulunmuyor.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className={`bg-white dark:bg-slate-900 border rounded-[4px] p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative ${request.isVerified ? "border-emerald-500/20 shadow-emerald-500/5" : "border-slate-200 dark:border-slate-800"}`}>
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Company & Personal Info */}
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 ${request.isVerified ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        <Building2 size={20} />
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h3 className="text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">
                              {request.companyName}
                           </h3>
                           {request.isVerified && (
                             <span className="px-2 py-0.5 bg-emerald-600 text-white text-[7px] font-black uppercase tracking-widest italic rounded shadow-lg shadow-emerald-500/20">
                                DOĞRULANMIŞ
                             </span>
                           )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 italic uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><User size={10} className="text-emerald-500" /> {request.fullName}</span>
                           <span className="flex items-center gap-1.5"><Map size={10} className="text-slate-400" /> {request.sector}</span>
                        </div>
                     </div>
                  </div>

                  {/* Right: Contact & Date */}
                  <div className="flex flex-col lg:items-end justify-center gap-2">
                     <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-[4px] border border-slate-100 dark:border-slate-700">
                        <Mail size={12} className="text-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-300 font-bold text-[11px]">{request.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pr-2">
                        <Calendar size={10} /> {format(new Date(request.createdAt), "dd MMM yyyy | HH:mm", { locale: tr })}
                        {!request.isVerified && (
                           <span className="flex items-center gap-1 text-amber-500/80 ml-2">
                              <Clock size={10} /> ONAY BEKLİYOR
                           </span>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

