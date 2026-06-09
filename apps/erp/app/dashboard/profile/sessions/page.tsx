"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { 
  History,
  LogOut,
  Shield,
  ArrowLeft
} from "lucide-react";
import { getUserSessions, killSession, killOtherSessions } from "../../../actions/system-actions";
import { useRouter } from "next/navigation";

export default function SessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const router = useRouter();
  const user = session?.user;

  const loadSessions = async () => {
     const res = await getUserSessions();
     if (res.success) setSessions(res.data || []);
  };

  React.useEffect(() => {
     if (user) loadSessions();
  }, [user]);

  const handleKillSession = async (id: string) => {
     const res = await killSession(id);
     if (res.success) loadSessions();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 font-medium italic">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
         <div className="space-y-1">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 hover:text-blue-500 transition-colors mb-2"
            >
              <ArrowLeft size={12} /> Geri Dön
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
              <History className="text-blue-600" size={32} />
              Oturum <span className="text-blue-600">Yönetimi</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Aktif oturumlarınızı kontrol edin ve uzaktan sonlandırın</p>
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 bg-slate-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-[4px] border border-slate-200 dark:border-zinc-800">
            <Shield size={12} className="text-blue-500" /> Remote Session Control Aktif
         </div>
      </div>

      {/* SESSION MANAGEMENT CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative group">
         <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-900 dark:text-slate-300">
               <History className="text-blue-600" size={14} /> Aktif Oturumlar
            </h3>
            <button 
               onClick={async () => {
                  const res = await killOtherSessions(""); 
                  if (res.success) loadSessions();
               }}
               className="text-[8px] font-black text-rose-600 hover:text-rose-500 uppercase tracking-widest transition-colors"
            >
               Tüm Diğer Oturumları Kapat
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
               <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest">Oturum ID</th>
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest">Cihaz / Tarayıcı</th>
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest">Geçerlilik</th>
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest text-right">İşlem</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {sessions.length > 0 ? sessions.map((s: any) => (
                     <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all italic">
                        <td className="p-4 font-mono text-[9px] text-slate-500">{s.id}</td>
                        <td className="p-4">
                           <div className="flex flex-col">
                              <span className="font-black text-slate-700 dark:text-slate-300 uppercase text-[10px]">Bilinmeyen Cihaz</span>
                              <span className="text-[8px] text-slate-400 uppercase tracking-widest">Son Erişim: {new Date(s.expires).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                           {new Date(s.expires).toLocaleString("tr-TR")}
                        </td>
                        <td className="p-4 text-right">
                           <button 
                              onClick={() => handleKillSession(s.id)}
                              className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-600 hover:text-white rounded-[4px] transition-all"
                           >
                              <LogOut size={12} />
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 uppercase font-black tracking-widest text-[10px]">
                           Aktif oturum kaydı bulunamadı
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[4px] border border-blue-100 dark:border-blue-900/30 italic">
         <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
            <span className="font-black">GÜVENLİK NOTU:</span> Başka bir cihazda oturumunuzun açık kaldığını düşünüyorsanız "Tüm Diğer Oturumları Kapat" butonunu kullanarak mevcut oturumunuz dışındaki tüm girişleri sonlandırabilirsiniz.
         </p>
      </div>

    </div>
  );
}
