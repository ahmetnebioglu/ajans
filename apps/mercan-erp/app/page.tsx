import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "CUSTOMER") {
      redirect("/customer-portal");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-500 font-medium italic">
      <div className="max-w-md w-full space-y-10 bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 dark:bg-blue-600/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
        
        <div className="text-center space-y-3 relative z-10">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">MERCAN ERP</h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em]">
            İş Sağlığı ve Güvenliği Yönetim Sistemi
          </p>
        </div>

        <div className="space-y-4 relative z-10">
          <Link
            href="/dashboard"
            className="group w-full flex items-center justify-between px-8 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95"
          >
            YÖNETİM KOKPİTİ <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/drive"
            className="group w-full flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
          >
            Saha Raporları <span className="text-slate-300 dark:text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          
          <Link
            href="/mail"
            className="group w-full flex items-center justify-between px-8 py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          >
            Sistem Yönetimi <span className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="text-center pt-4 relative z-10">
          <p className="text-[8px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest">
            Powered by AJANS MONOREPO
          </p>
        </div>
      </div>
    </main>
  );
}
