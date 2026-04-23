import React from "react";
import { prisma as db } from "@ajans/db";
import { User, Mail, Building2, Map, Calendar, ShieldCheck, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function ReferenceRequestsPage() {
  const requests = await db.referenceRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Referans Talepleri</h1>
          <p className="text-slate-500 font-medium italic">Sektörel referans listesi isteyen firmalar.</p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
             <FileText size={48} className="mx-auto text-slate-700 mb-4" />
             <p className="text-slate-500 font-black uppercase italic tracking-widest text-sm">Henüz bir talep bulunmuyor.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className={`bg-white/5 border rounded-2xl p-6 hover:bg-white/[0.07] transition-all group relative ${request.isVerified ? "border-emerald-500/20" : "border-white/5"}`}>
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Company & Personal Info */}
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${request.isVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-slate-500"}`}>
                        <Building2 size={24} />
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight">
                              {request.companyName}
                           </h3>
                           {request.isVerified && (
                             <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest italic rounded shadow-lg shadow-emerald-500/20">
                                DOĞRULANMIŞ
                             </span>
                           )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 italic uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><User size={12} className="text-blue-500" /> {request.fullName}</span>
                           <span className="flex items-center gap-1.5"><Map size={12} className="text-slate-600" /> {request.sector}</span>
                        </div>
                     </div>
                  </div>

                  {/* Right: Contact & Date */}
                  <div className="flex flex-col lg:items-end justify-center gap-2">
                     <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                        <Mail size={14} className="text-blue-500" />
                        <span className="text-slate-300 font-bold text-xs">{request.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest pr-2">
                        <Calendar size={12} /> {format(new Date(request.createdAt), "dd MMMM yyyy | HH:mm", { locale: tr })}
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
