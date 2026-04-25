
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
    const result = await signIn("credentials", { 
      email: testEmail, 
      password: "test", 
      callbackUrl: "/dashboard",
      redirect: false
    });
    console.log(">>> [Client:Login] signIn result:", JSON.stringify(result, null, 2));
    if (result?.ok) {
      console.log(">>> [Client:Login] Redirecting to /dashboard...");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 italic font-medium transition-colors duration-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO & TEXT */}
        <div className="text-center space-y-3">
           <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-white rounded-[2px] flex items-center justify-center mx-auto shadow-2xl rotate-3">
              <Building2 size={32} />
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">MERCAN ERP</h1>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.4em]">GÜVENLİ YÖNETİM PANELİ</p>
           </div>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2px] shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 relative overflow-hidden group">
           <ShieldCheck className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800/10 w-32 h-32 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
           
           <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">TEKRAR HOŞ GELDİNİZ</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-relaxed uppercase tracking-widest leading-none">Lütfen devam etmek için kurumsal hesabınızla oturum açın.</p>
           </div>

           <button 
             onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
             className="w-full relative z-10 flex items-center justify-between px-6 py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-[2px] border border-zinc-700 font-black uppercase tracking-widest text-[10px] hover:bg-teal-600 dark:hover:bg-teal-500 active:scale-95 transition-all shadow-xl shadow-zinc-900/20"
           >
              Google ile Giriş Yap
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-teal-400 rounded-[2px] animate-ping" />
                 <ArrowRight size={18} />
              </div>
           </button>

           {/* DEV ONLY LOGIN AREA */}
           { (isDev || process.env.NODE_ENV === 'test') && (
             <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-500">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-[2px] animate-pulse" />
                   Geliştirici Modu: Test Girişi
                </div>
                <form onSubmit={handleTestLogin} className="space-y-2">
                   <input 
                     type="email" 
                     placeholder="E-posta: admin@mercan.com"
                     className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2px] text-[11px] font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono dark:text-white"
                     value={testEmail}
                     onChange={(e) => setTestEmail(e.target.value)}
                   />
                   <button className="w-full p-3.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-[2px] border border-teal-200 dark:border-teal-800 font-black text-[10px] uppercase tracking-widest hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all active:scale-95 shadow-sm">
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
