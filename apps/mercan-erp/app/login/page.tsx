"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Building2, ShieldCheck, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [testEmail, setTestEmail] = React.useState("");
  const isDev = process.env.NODE_ENV === "development";

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    await signIn("credentials", { 
      email: testEmail, 
      password: "test", 
      callbackUrl: "/dashboard" 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 italic font-medium transition-colors duration-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO & TEXT */}
        <div className="text-center space-y-4">
           <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl rotate-6 animate-pulse">
              <Building2 size={40} />
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">MERCAN ERP</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em]">GÜVENLİ YÖNETİM PANELİ</p>
           </div>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8 relative overflow-hidden group">
           <ShieldCheck className="absolute -right-8 -bottom-8 text-slate-50 dark:text-slate-800/10 w-40 h-40 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
           
           <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">TEKRAR HOŞ GELDİNİZ</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed uppercase tracking-widest">Lütfen devam etmek için kurumsal Google hesabınızla oturum açın.</p>
           </div>

           <button 
             onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
             className="w-full relative z-10 flex items-center justify-between px-8 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 dark:hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
           >
              Google ile Giriş Yap
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                 <ArrowRight size={18} />
              </div>
           </button>

           {/* DEV ONLY LOGIN AREA */}
           {isDev && (
             <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-500">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                   Geliştirici Modu: Test Girişi
                </div>
                <form onSubmit={handleTestLogin} className="space-y-2">
                   <input 
                     type="email" 
                     placeholder="E-posta: uzman1@mercan.com"
                     className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono dark:text-white"
                     value={testEmail}
                     onChange={(e) => setTestEmail(e.target.value)}
                   />
                   <button className="w-full p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all active:scale-95 shadow-sm">
                     HIZLI GİRİŞ YAP
                   </button>
                </form>
             </div>
           )}

           <div className="pt-4 text-center relative z-10">
              <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-loose">
                Bu sisteme sadece yetkili Mercan Grup personeli <br /> ve tanımlı müşteriler erişebilir.
              </p>
           </div>
        </div>

        {/* FOOTER */}
        <div className="text-center">
           <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em] italic opacity-50">© 2026 MERCAN GRUP DIJITAL ARSIV SISTEMI</p>
        </div>

      </div>
    </div>
  );
}
