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
  History
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as any)?.role || "USER";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 font-medium italic">
      
      {/* PROFILE HEADER / HERO */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
         <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
            <Shield className="absolute -right-10 -top-10 w-48 h-48 text-white/10 rotate-12" />
         </div>
         
         <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 relative z-10">
                <div className="relative group">
                   {user?.image ? (
                     <img src={user.image} alt="" className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 shadow-2xl group-hover:scale-105 transition-transform" />
                   ) : (
                     <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl border-4 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center text-slate-300">
                        <UserIcon size={64} />
                     </div>
                   )}
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 size={20} />
                   </div>
                </div>
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none not-italic">
                      {user?.name || "Kullanıcı Adı"}
                   </h1>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 shadow-sm">
                         <Shield size={12} /> {role}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                         <Mail size={12} /> {user?.email}
                      </div>
                   </div>
                </div>

                <button className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                   <Settings size={14} /> PROFİLİ DÜZENLE
                </button>
            </div>
         </div>
      </div>

      {/* STATS / INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
                   <Calendar size={24} />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Kayıt Tarihi</div>
             </div>
             <p className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">NİSAN 2026</p>
         </div>

         <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                   <History size={24} />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Son Giriş</div>
             </div>
             <p className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">BUGÜN, 17:35</p>
         </div>

         <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg group hover:border-amber-200 dark:hover:border-amber-800 transition-all">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-inner">
                   <Bell size={24} />
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Bildirimler</div>
             </div>
             <p className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight italic">3 YENİ MESAJ</p>
         </div>
      </div>

      {/* SETTINGS PREVIEW */}
      <div className="bg-slate-100 dark:bg-slate-800/30 p-10 rounded-[2rem] border border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-8 italic">
         <div className="space-y-2 text-center md:text-left">
            <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">GÜVENLİK AYARLARI</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">İki adımlı doğrulama ve şifre yönetimi</p>
         </div>
         <button className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md">
            <Lock size={16} /> GÜVENLİK KONTROLÜ
         </button>
      </div>

    </div>
  );
}
