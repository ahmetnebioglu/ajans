import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Giriş yapmış kullanıcılar için yönlendirme
  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "CUSTOMER") {
      redirect("/customer-portal");
    } else if ((session.user as any).currentWorkspaceId) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  }

  const modules = [
    {
      name: "Drive",
      desc: "Dosya yönetimi ve dijital arşiv",
      color: "from-blue-600 to-blue-800",
      shadowColor: "shadow-blue-600/20",
      icon: "📂",
    },
    {
      name: "CMS",
      desc: "Web sitesi içerik yönetimi",
      color: "from-emerald-600 to-emerald-800",
      shadowColor: "shadow-emerald-600/20",
      icon: "🌐",
    },
    {
      name: "HR",
      desc: "İnsan kaynakları ve bordro",
      color: "from-purple-600 to-purple-800",
      shadowColor: "shadow-purple-600/20",
      icon: "👥",
    },
    {
      name: "CRM",
      desc: "Müşteri ilişkileri yönetimi",
      color: "from-red-600 to-red-800",
      shadowColor: "shadow-red-600/20",
      icon: "💬",
    },
  ];

  const features = [
    { title: "Multi-Tenant", desc: "Her workspace izole ve güvenli", icon: "🔒" },
    { title: "RBAC", desc: "Dinamik roller ve izinler", icon: "🛡️" },
    { title: "RLS", desc: "Veritabanı seviyesinde güvenlik", icon: "🏗️" },
    { title: "Modüler", desc: "İhtiyacınıza göre modüller", icon: "🧩" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-medium italic overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[5%] right-[10%] w-96 h-96 bg-blue-500/5 dark:bg-blue-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-purple-500/5 dark:bg-purple-500/3 rounded-full blur-3xl" />
          <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-indigo-500/3 dark:bg-indigo-500/2 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 rotate-3 mb-8 transition-transform hover:rotate-0 duration-500">
            <span className="text-3xl font-black tracking-tighter">E</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none text-center mb-4">
            ERP{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              UNIFIED
            </span>{" "}
            OS
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.5em] text-center mb-8">
            İŞLETMENİZİ TEK BİR PLATFORMDAN YÖNETİN
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg text-center mb-12 leading-relaxed not-italic">
            Drive, CMS, HR ve CRM modülleriyle tüm iş süreçlerinizi tek bir
            platformda birleştirin. Multi-tenant altyapı ve dinamik rol yönetimi
            ile güvenli ve ölçeklenebilir.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <Link
              href="/register"
              id="cta-register"
              className="group flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              ÜCRETSİZ BAŞLA
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/login"
              id="cta-login"
              className="group flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-md active:scale-95"
            >
              GİRİŞ YAP
              <span className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            MODÜLLER
          </h2>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em] mt-2">
            İHTİYACINIZA GÖRE AKTİFLEŞTİRİN
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className={`group relative p-6 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl shadow-lg ${mod.shadowColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="text-3xl mb-3">{mod.icon}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {mod.name}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                {mod.desc}
              </p>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="text-center space-y-2">
                <div className="text-2xl">{feat.icon}</div>
                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  {feat.title}
                </h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-zinc-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[8px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest">
            © 2026 ERP UNIFIED OS — POWERED BY AJANS MONOREPO
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              GİRİŞ YAP
            </Link>
            <Link
              href="/register"
              className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 transition-colors"
            >
              KAYIT OL
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
