import React from "react";
import { prisma as db } from "@ajans/db";
import { Mail, Calendar, User, MessageSquare, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function ContactRequestsPage() {
  const requests = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">İletişim Talepleri</h1>
          <p className="text-slate-500 font-medium italic">Web sitesi iletişim formundan gelen mesajlar.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl font-bold text-sm italic border border-blue-500/10">
          <MessageSquare size={18} /> {requests.length} Toplam Mesaj
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
             <Mail size={48} className="mx-auto text-slate-700 mb-4" />
             <p className="text-slate-500 font-black uppercase italic tracking-widest text-sm">Henüz bir mesaj bulunmuyor.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className={`bg-white/5 border rounded-2xl p-6 hover:bg-white/[0.07] transition-all group relative overflow-hidden ${request.isVerified ? "border-emerald-500/20 shadow-emerald-500/5" : "border-white/5"}`}>
               {/* Verified Badge */}
               {request.isVerified && (
                 <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] italic rounded-bl-xl shadow-lg flex items-center gap-2">
                    <ShieldCheck size={12} /> DOĞRULANMIŞ MESAJ
                 </div>
               )}

               <div className="flex flex-col gap-6">
                  {/* Top: Header Info */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${request.isVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-slate-500"}`}>
                           <User size={24} />
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight">
                              {request.name}
                           </h3>
                           <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 italic uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Mail size={12} className="text-blue-500" /> {request.email}</span>
                              {!request.isVerified && (
                                <span className="flex items-center gap-1.5 text-amber-500/80"><Clock size={12} /> ONAY BEKLİYOR</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg">
                        <Calendar size={14} /> 
                        {format(new Date(request.createdAt), "dd MMMM yyyy | HH:mm", { locale: tr })}
                     </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">{request.subject || "Konu Belirtilmemiş"}</h4>
                     </div>
                     <p className={`text-slate-400 font-medium italic leading-relaxed text-sm p-6 rounded-2xl border ${request.isVerified ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.02] border-white/5"}`}>
                        {request.message}
                     </p>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
