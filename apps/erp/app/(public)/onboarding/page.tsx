"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowRight,
  Loader2,
  Rocket,
  CheckCircle2,
  Zap,
  Globe,
  Users,
  MessageSquare,
} from "lucide-react";

function OnboardingContent() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"name" | "creating" | "done">("name");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Giriş yapmamış kullanıcıyı login'e yönlendir
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Zaten workspace'i olan kullanıcıyı dashboard'a yönlendir
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.currentWorkspaceId
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (workspaceName.trim().length < 2) {
      setError("Çalışma alanı adı en az 2 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setStep("creating");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName: workspaceName.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Çalışma alanı oluşturulamadı.");
        setStep("name");
        setLoading(false);
        return;
      }

      // Session'ı güncelle (yeni workspace bilgileri ile)
      await updateSession({
        currentWorkspaceId: data.workspaceId,
        permissions: [],
      });

      setStep("done");

      // 2 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setStep("name");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const modules = [
    { icon: <Zap size={18} />, name: "Drive", desc: "Dosya Yönetimi", color: "text-blue-500" },
    { icon: <Globe size={18} />, name: "CMS", desc: "İçerik Yönetimi", color: "text-emerald-500" },
    { icon: <Users size={18} />, name: "HR", desc: "İnsan Kaynakları", color: "text-purple-500" },
    { icon: <MessageSquare size={18} />, name: "CRM", desc: "Müşteri İlişkileri", color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 italic font-medium transition-colors duration-500 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[15%] w-64 h-64 bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-purple-500/5 dark:bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        {/* Başlık */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/30 rotate-3 transition-transform hover:rotate-0 duration-500">
            {mounted ? (
              step === "done" ? <CheckCircle2 size={32} /> : <Rocket size={32} />
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              {step === "done" ? "HAZIR!" : "HOŞ GELDİNİZ"}
            </h1>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em]">
              {step === "done"
                ? "ÇALIŞMA ALANINIZ OLUŞTURULDU"
                : "İLK ÇALIŞMA ALANINIZI OLUŞTURUN"}
            </p>
          </div>
        </div>

        {/* Ana Kart */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200/50 dark:border-zinc-800 space-y-6 relative overflow-hidden">
          {/* Başarılı Ekranı */}
          {step === "done" && (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  {workspaceName}
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  Çalışma alanınız hazır. Dashboard&apos;a yönlendiriliyorsunuz...
                </p>
              </div>
              <Loader2 size={20} className="animate-spin text-blue-600 mx-auto" />
            </div>
          )}

          {/* Oluşturuluyor Animasyonu */}
          {step === "creating" && (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-500">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 size={28} className="text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  OLUŞTURULUYOR...
                </h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  Workspace, roller ve izinler hazırlanıyor
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {step === "name" && (
            <>
              <div className="space-y-2">
                <h3 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white uppercase">
                  ÇALIŞMA ALANI ADI
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  İşletme veya ekip adınızı girin. Bu ad workspace&apos;inizi tanımlayacak.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    id="onboarding-workspace-name"
                    type="text"
                    placeholder="Örn: Acme Teknoloji A.Ş."
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white placeholder:text-slate-400"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                    minLength={2}
                    autoFocus
                  />
                </div>

                <button
                  id="onboarding-submit"
                  type="submit"
                  disabled={loading || workspaceName.trim().length < 2}
                  className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  ÇALIŞMA ALANINI OLUŞTUR
                  {mounted && <ArrowRight size={18} />}
                </button>
              </form>

              {/* Modül Önizleme */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-3">
                  AKTİF MODÜLLER
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {modules.map((mod) => (
                    <div
                      key={mod.name}
                      className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800"
                    >
                      <span className={mod.color}>{mod.icon}</span>
                      <div>
                        <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          {mod.name}
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                          {mod.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
