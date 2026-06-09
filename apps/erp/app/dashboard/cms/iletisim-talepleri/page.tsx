import React from "react";
import { prisma as db } from "@/lib/db";
import { Mail, Calendar, User, MessageSquare, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function ContactRequestsPage() {
  const requests = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6 font-medium italic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">İletişim <span className="text-emerald-600">Talepleri</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Web sitesi iletişim formundan gelen mesajlar.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-[4px] font-black text-[10px] uppercase tracking-widest border border-emerald-500/10">
          <MessageSquare size={16} /> {requests.length} Toplam Mesaj
        </div>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800">
             <Mail size={40} className="mx-auto text-slate-300 dark:text-slate-800 mb-4" />
             <p className="text-slate-400 font-black uppercase italic tracking-widest text-[10px]">Henüz bir mesaj bulunmuyor.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className={`bg-white dark:bg-slate-900 border rounded-[4px] p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group relative overflow-hidden ${request.isVerified ? "border-emerald-500/20 shadow-emerald-500/5" : "border-slate-200 dark:border-slate-800"}`}>
               {/* Verified Badge */}
               {request.isVerified && (
                 <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-[0.2em] italic rounded-bl shadow-lg flex items-center gap-2">
                    <ShieldCheck size={10} /> DOĞRULANMIŞ
                 </div>
               )}

               <div className="flex flex-col gap-5">
                  {/* Top: Header Info */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 ${request.isVerified ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                           <User size={20} />
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">
                              {request.name}
                           </h3>
                           <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 italic uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Mail size={10} className="text-emerald-500" /> {request.email}</span>
                              {!request.isVerified && (
                                <span className="flex items-center gap-1.5 text-amber-500/80"><Clock size={10} /> ONAY BEKLİYOR</span>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-[4px] border border-slate-100 dark:border-slate-700">
                        <Calendar size={12} /> 
                        {format(new Date(request.createdAt), "dd MMM yyyy | HH:mm", { locale: tr })}
                     </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">{request.subject || "Konu Belirtilmemiş"}</h4>
                     </div>
                     <p className={`text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed text-xs p-4 rounded-[4px] border ${request.isVerified ? "bg-emerald-500/5 border-emerald-500/10" : "bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800"}`}>
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

