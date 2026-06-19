"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function RegisterContent() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    try {
      // 1. Kayıt API çağrısı
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
        setLoading(false);
        return;
      }

      // 2. Otomatik giriş yap
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Hesap oluşturuldu ancak giriş yapılamadı. Lütfen giriş sayfasından tekrar deneyin.");
        setLoading(false);
        return;
      }

      // 3. Onboarding'e yönlendir
      router.push("/onboarding");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 italic font-medium transition-colors duration-500 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] left-[5%] w-96 h-96 bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-3xl" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/3 dark:bg-indigo-500/2 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        {/* Logo ve Başlık */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/30 rotate-3 transition-transform hover:rotate-0 duration-500">
            {mounted ? <Sparkles size={32} /> : <div className="w-8 h-8" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              HESAP OLUŞTUR
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em]">
              ERP UNIFIED OS PLATFORMUNA KATIL
            </p>
          </div>
        </div>

        {/* Form Kartı */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200/50 dark:border-zinc-800 space-y-6 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 text-slate-100 dark:text-zinc-800/10 w-36 h-36 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
            {mounted && <Building2 size={144} strokeWidth={0.5} />}
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="relative z-10 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            {/* Ad Soyad */}
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="register-name"
                type="text"
                placeholder="Ad Soyad"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white placeholder:text-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* E-posta */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="register-email"
                type="email"
                placeholder="ornek@sirket.com"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Şifre */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="register-password"
                type="password"
                placeholder="Şifre (min. 6 karakter)"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {/* Şifre Tekrar */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="register-confirm-password"
                type="password"
                placeholder="Şifre Tekrar"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white placeholder:text-slate-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {/* Kayıt Butonu */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "HESAP OLUŞTURULUYOR..." : "HESAP OLUŞTUR"}
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                mounted && <ArrowRight size={18} />
              )}
            </button>
          </form>

          {/* Giriş Yap Linki */}
          <div className="pt-2 text-center relative z-10">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
              Zaten bir hesabınız var mı?{" "}
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-black uppercase tracking-wide"
              >
                GİRİŞ YAP
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em] italic opacity-50">
            © 2026 ERP UNIFIED OS
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
