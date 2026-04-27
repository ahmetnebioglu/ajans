"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { 
  User as UserIcon, 
  Shield, 
  Mail, 
  Calendar, 
  CheckCircle2,
  Settings,
  Bell,
  Lock,
  History,
  LogOut,
  BarChart3
} from "lucide-react";
import { getUserSessions, killSession, killOtherSessions } from "../../actions/system-actions";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = React.useState<any[]>([]);
  const user = session?.user;
  const role = (user as any)?.role || "USER";

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
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 font-medium italic">
      
      {/* PROFILE HEADER / HERO */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
         <div className="h-24 bg-gradient-to-r from-slate-100 to-indigo-100 dark:from-zinc-900 dark:to-indigo-950 relative overflow-hidden">
            <Shield className="absolute -right-5 -top-5 w-32 h-32 text-indigo-600/5 dark:text-white/5 rotate-12" />
         </div>
         
         <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-end gap-4 -mt-10 relative z-10">
                <div className="relative group">
                   {user?.image ? (
                     <img 
                       src={user.image} 
                       alt="" 
                       className="w-24 h-24 rounded-[4px] border-2 border-white dark:border-zinc-800 shadow-2xl group-hover:scale-105 transition-transform object-cover" 
                       onError={(e) => {
                         (e.target as HTMLImageElement).style.display = 'none';
                         const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.image-fallback');
                         if (fallback) (fallback as HTMLElement).style.display = 'flex';
                       }}
                     />
                   ) : null}
                   <div className={`image-fallback w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-[4px] border-2 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center text-slate-300 ${user?.image ? 'hidden' : 'flex'}`}>
                      <UserIcon size={48} />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-2 border-white dark:border-zinc-800 rounded-[4px] flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 size={16} />
                   </div>
                </div>
                
                <div className="flex-1 space-y-1 text-center md:text-left">
                   <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none not-italic">
                      {user?.name || "Kullanıcı Adı"}
                   </h1>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[4px] text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 shadow-sm">
                         <Shield size={10} /> {role}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                         <Mail size={10} /> {user?.email}
                      </div>
                   </div>
                </div>

                <button className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-[4px] text-[9px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                   <Settings size={14} /> PROFİLİ DÜZENLE
                </button>
            </div>
         </div>
      </div>

      {/* STATS / INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-lg group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[4px] flex items-center justify-center shadow-inner">
                   <Calendar size={20} />
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Kayıt Tarihi</div>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">NİSAN 2026</p>
         </div>

         <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-lg group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[4px] flex items-center justify-center shadow-inner">
                   <History size={20} />
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Son Giriş</div>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">BUGÜN, 17:35</p>
         </div>

         <div className="bg-white dark:bg-zinc-900 p-6 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-lg group hover:border-amber-200 dark:hover:border-amber-800 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[4px] flex items-center justify-center shadow-inner">
                   <Bell size={20} />
                </div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Bildirimler</div>
             </div>
             <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">3 YENİ MESAJ</p>
         </div>
      </div>

      {/* SESSION MANAGEMENT */}
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative group">
         <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-900 dark:text-slate-300">
               <History className="text-blue-600" size={14} /> Aktif Oturumlar
            </h3>
            <button 
               onClick={async () => {
                  const res = await killOtherSessions(""); // Token logic can be refined
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
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest">Geçerlilik</th>
                     <th className="p-4 font-black uppercase text-slate-400 tracking-widest text-right">İşlem</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {sessions.length > 0 ? sessions.map((s: any) => (
                     <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all italic">
                        <td className="p-4 font-mono text-[9px] text-slate-500">{s.id}</td>
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
                        <td colSpan={3} className="p-8 text-center text-slate-400 uppercase font-black tracking-widest text-[10px]">
                           Aktif oturum kaydı bulunamadı
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* SETTINGS PREVIEW */}
      <div className="bg-slate-50 dark:bg-zinc-800/30 p-8 rounded-[4px] border border-slate-100 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6 italic">
         <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">GÜVENLİK AYARLARI</h4>
            <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1">İki adımlı doğrulama ve şifre yönetimi</p>
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[4px] text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm">
            <Lock size={14} /> GÜVENLİK KONTROLÜ
         </button>
      </div>

    </div>
  );
}
