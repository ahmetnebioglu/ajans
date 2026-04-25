"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { 
  Button, 
  Card, 
  CardContent, 
  Input 
} from "@ajans/ui";
import { 
  Sparkles, 
  LogIn, 
  GraduationCap, 
  Users, 
  Heart,
  Smile,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"parent" | "admin">("parent");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.ok) {
      window.location.href = "/dashboard";
    } else {
      setLoading(false);
      // Hata gösterimi eklenebilir
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Playful Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/30 dark:bg-orange-900/10 rounded-full blur-[100px] animate-pulse delay-700" />
      
      <Link href="/" className="flex flex-col items-center gap-2 mb-8 group relative z-10">
        <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[2px] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500 border border-indigo-100 dark:border-slate-800">
          <GraduationCap className="text-indigo-500" size={32} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase">
            Okul <span className="text-indigo-500">İzin</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <div className="h-[1px] w-3 bg-orange-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Mutabakat Sistemi</span>
            <div className="h-[1px] w-3 bg-orange-400" />
          </div>
        </div>
      </Link>

      <Card className="w-full max-w-md border border-indigo-100 dark:border-slate-800 shadow-2xl rounded-[2px] relative z-10 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="p-2 border-b border-indigo-50/50 dark:border-slate-800/50">
          <div className="flex p-1 bg-slate-100/50 dark:bg-white/5 rounded-[2px]">
            <button 
              onClick={() => setActiveTab("parent")}
              className={`flex-1 py-3 rounded-[2px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'parent' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
            >
              <Users size={14} /> Veli
            </button>
            <button 
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-3 rounded-[2px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
            >
              <ShieldCheck size={14} /> İdareci
            </button>
          </div>
        </div>

        <CardContent className="p-8 pt-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-[2px] text-[9px] font-black uppercase tracking-wider">
              <Sparkles size={10} /> Hoş Geldiniz
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
              {activeTab === "parent" ? "Merhaba Veli!" : "İdareci Paneli"}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Eğitim yolculuğunda yanınızdayız.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="E-Posta Adresi" 
              type="email" 
              name="email"
              placeholder="okul@ajans.com"
              className="rounded-[2px] border-slate-200 dark:border-slate-800 bg-slate-50/50"
              required
            />
            <Input 
              label="Şifre" 
              type="password" 
              name="password"
              placeholder="••••••••"
              className="rounded-[2px] border-slate-200 dark:border-slate-800 bg-slate-50/50"
              required
            />

            <Button className="w-full py-6 rounded-[2px] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/10 text-xs font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 active:translate-y-0" disabled={loading}>
              {loading ? "Giriş Yapılıyor..." : (
                <div className="flex items-center gap-2">
                  <span>Devam Edelim</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
              <span className="bg-white dark:bg-slate-900 px-4">Sosyal Giriş</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-6 rounded-[2px] border border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-600 bg-transparent transition-all" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Google ile Bağlan</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
        Henüz üyeliğiniz yok mu? <Link href="/register" className="text-indigo-500 hover:underline">Aramıza Katılın</Link>
      </p>
    </div>
  );
}
