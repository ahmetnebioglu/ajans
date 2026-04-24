"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Input 
} from "@ajans/ui";
import { ShieldCheck, LogIn, Mail, Lock, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"parent" | "admin">("parent");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simüle edilmiş giriş (Credential provider kullanılabilir)
    // Gerçekte signIn("credentials", { ... }) çağrılır.
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-3 mb-10 group">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-transform">
          <ShieldCheck className="text-white" size={28} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black uppercase tracking-tighter dark:text-white">Okul ERP</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600">İzin Sistemi</span>
        </div>
      </Link>

      <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="p-0 border-none">
          <div className="flex p-2 bg-slate-100 dark:bg-white/5 rounded-t-[2rem]">
            <button 
              onClick={() => setActiveTab("parent")}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'parent' ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users size={14} /> Veli Girişi
            </button>
            <button 
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <GraduationCap size={14} /> İdareci Girişi
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-10 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Giriş Yapın</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              {activeTab === "parent" ? "Veliler için güvenli erişim portalı" : "Öğretmen ve İdareciler için yönetim paneli"}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="E-Posta Adresi" 
              type="email" 
              placeholder="email@example.com"
              required
            />
            <Input 
              label="Şifre" 
              type="password" 
              placeholder="••••••••"
              required
            />

            <Button className="w-full py-5" disabled={loading}>
              {loading ? "Giriş Yapılıyor..." : <><LogIn className="mr-2" size={16} /> Devam Et</>}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
              <span className="bg-white dark:bg-slate-900 px-4 italic">Veya</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-5 border-2" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google ile Devam Et
          </Button>
        </CardContent>
      </Card>

      <p className="mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
        Henüz bir hesabınız yok mu? <Link href="/register" className="text-blue-600 hover:underline">Kaydolun</Link>
      </p>
    </div>
  );
}
