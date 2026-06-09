"use client";

import React, { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Building2, ShieldCheck, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

type Step = "email" | "code";

function LoginContent() {
  const [mounted, setMounted] = React.useState(false);
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [testEmail, setTestEmail] = React.useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (urlError === "TenantMismatch") {
      setError("Bu hesap Mercan ERP için yetkili değil.");
    }
  }, [urlError]);

  const isDevOrTest =
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test" ||
    (typeof window !== "undefined" &&
      window.location.hostname === "localhost");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kod gönderilemedi.");
        return;
      }

      setInfo(data.message || "Doğrulama kodu gönderildi.");
      if (data.devHint) {
        setInfo(`${data.message} ${data.devHint}`);
      }
      setStep("code");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("email-otp", {
      email: email.trim().toLowerCase(),
      code: code.trim(),
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Geçersiz kod veya e-posta. Tekrar deneyin.");
      return;
    }

    if (result?.ok) {
      window.location.href = callbackUrl;
    }
  };

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    await signIn("credentials", {
      email: testEmail,
      password: "test",
      callbackUrl,
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 italic font-medium transition-colors duration-500">
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-white rounded-[2px] flex items-center justify-center mx-auto shadow-2xl rotate-3">
            {mounted ? <Building2 size={32} /> : <div className="w-8 h-8" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              MERCAN ERP
            </h1>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.4em]">
              GÜVENLİ YÖNETİM PANELİ
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2px] shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 relative overflow-hidden group">
          {mounted && (
            <ShieldCheck className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800/10 w-32 h-32 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
          )}

          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">
              {step === "email" ? "TEKRAR HOŞ GELDİNİZ" : "DOĞRULAMA KODU"}
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest leading-none">
              {step === "email"
                ? "Kurumsal e-postanızı girin, size tek kullanımlık kod gönderelim."
                : `${email} adresine gönderilen 6 haneli kodu girin.`}
            </p>
          </div>

          {error && (
            <p className="relative z-10 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
              {error}
            </p>
          )}
          {info && (
            <p className="relative z-10 text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              {info}
            </p>
          )}

          {step === "email" ? (
            <form
              onSubmit={handleSendCode}
              className="space-y-3 relative z-10"
            >
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type="email"
                  placeholder="ornek@mercan.com"
                  className="w-full pl-10 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2px] text-[11px] font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-[2px] border border-zinc-700 font-black uppercase tracking-widest text-[10px] hover:bg-teal-600 dark:hover:bg-teal-500 active:scale-95 transition-all shadow-xl shadow-zinc-900/20 disabled:opacity-60"
              >
                {loading ? "GÖNDERİLİYOR..." : "DOĞRULAMA KODU GÖNDER"}
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  mounted && <ArrowRight size={18} />
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyLogin}
              className="space-y-3 relative z-10"
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="6 haneli kod (örn. 111111)"
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2px] text-center text-2xl font-black tracking-[0.4em] outline-none focus:ring-2 focus:ring-teal-500 transition-all dark:text-white font-mono"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                autoComplete="one-time-code"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full flex items-center justify-between px-6 py-4 bg-teal-600 text-white rounded-[2px] font-black uppercase tracking-widest text-[10px] hover:bg-teal-500 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? "DOĞRULANIYOR..." : "GİRİŞ YAP"}
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  mounted && <ArrowRight size={18} />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                  setInfo(null);
                }}
                className="w-full text-[9px] font-black uppercase text-zinc-400 hover:text-teal-600 transition-colors"
              >
                ← Farklı e-posta kullan
              </button>
            </form>
          )}

          {isDevOrTest && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-500">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-[2px] animate-pulse" />
                Geliştirici: @mercan.test hızlı giriş
              </div>
              <form onSubmit={handleTestLogin} className="space-y-2">
                <input
                  type="email"
                  placeholder="admin@mercan.test"
                  className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2px] text-[11px] font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all font-mono dark:text-white"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full p-3.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-[2px] border border-teal-200 dark:border-teal-800 font-black text-[10px] uppercase tracking-widest hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all active:scale-95 shadow-sm"
                >
                  HIZLI GİRİŞ (ŞİFRE)
                </button>
              </form>
            </div>
          )}

          <div className="pt-4 text-center relative z-10">
            <p className="text-[8px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest leading-loose">
              Bu sisteme sadece yetkili Mercan Grup personeli <br /> ve
              tanımlı müşteriler erişebilir.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[9px] font-black text-slate-500 dark:text-slate-700 uppercase tracking-[0.4em] italic opacity-50">
            © 2026 MERCAN GRUP DIJITAL ARSIV SISTEMI
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
