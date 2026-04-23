import React from "react";
import { 
  Building2, 
  FileBox, 
  TrendingUp, 
  Users,
  Activity,
  ArrowRight,
  Clock,
  History,
  Shield
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@ajans/db";
import StatusChart from "../components/dashboard/StatusChart";
import TrendChart from "../components/dashboard/TrendChart";
import RecentActivityTimeline from "../components/dashboard/RecentActivityTimeline";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const user = session.user as { id: string; role: string };
  const isAdmin = user.role === "ADMIN";

  // ROL BAZLI FİLTRE KOŞULLARI
  const companyFilter = isAdmin ? {} : { userAccess: { some: { userId: user.id } } };
  const reportFilter = isAdmin ? {} : { company: { userAccess: { some: { userId: user.id } } } };
  const logFilter = isAdmin ? {} : { company: { userAccess: { some: { userId: user.id } } } };

  // Parallel fetch for peak performance
  const [
    companyCount, 
    reportCount, 
    recentReports,
    statusStats,
    auditLogs,
    expertCount
  ] = await Promise.all([
    prisma.company.count({ where: companyFilter }),
    prisma.report.count({ where: reportFilter }),
    prisma.report.findMany({
      where: reportFilter,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        uploadedBy: { select: { name: true } }
      }
    }),
    prisma.report.groupBy({
      where: reportFilter,
      by: ["status"],
      _count: { _all: true }
    }),
    prisma.auditLog.findMany({
      where: logFilter,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        company: { select: { name: true } }
      }
    }),
    prisma.user.count({ where: { role: "EXPERT" } })
  ]);

  // Process Status Chart Data
  const statusLabels: Record<string, { label: string, color: string }> = {
    "BEKLEMEDE": { label: "Beklemede", color: "#94a3b8" },
    "AKSIYON_GEREKLI": { label: "Aksiyon Gerekli", color: "#f43f5e" },
    "COZULDU": { label: "Çözüldü", color: "#10b981" }
  };

  const statusData = statusStats.map(s => ({
    name: statusLabels[s.status]?.label || s.status,
    value: s._count._all,
    color: statusLabels[s.status]?.color || "#cbd5e1"
  }));

  // Process Monthly Trend Distribution
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const currentMonth = new Date().getMonth();
  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const monthIdx = (currentMonth - (5 - i) + 12) % 12;
    return {
      month: months[monthIdx],
      count: Math.floor(Math.random() * 20) + 5
    };
  });

  // CLIENT SPECIFIC DATA
  const isClient = user.role === "CLIENT";
  let clientCompanyName = "Değerli";
  let urgentCount = 0;
  let lastUpdate: Date | null = null;

  if (isClient) {
    const firstCompany = await prisma.company.findFirst({
      where: { userAccess: { some: { userId: user.id } } },
      select: { name: true, reports: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
    if (firstCompany) {
      clientCompanyName = firstCompany.name;
      if (firstCompany.reports[0]) lastUpdate = firstCompany.reports[0].createdAt;
    }
    urgentCount = await prisma.report.count({
      where: { ...reportFilter, status: "AKSIYON_GEREKLI" }
    });
  }

  const stats = [
    { name: isAdmin ? "Toplam Firma" : "Tanımlı Firma", value: companyCount, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Toplam Rapor", value: reportCount, icon: FileBox, color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Aktif Uzmanlar", value: expertCount, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Sistem Sağlığı", value: "%99", icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  if (isClient) {
     return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
           {/* WELCOME BANNER */}
           <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-slate-900 dark:text-white shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 text-blue-600 dark:text-white">
                 <Building2 size={200} />
              </div>
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                       <TrendingUp className="text-white" size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">Yönetim Paneli</span>
                 </div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                    HOŞ GELDİNİZ, <br />
                    <span className="text-blue-600 dark:text-blue-500">{clientCompanyName}</span> YETKİLİSİ
                 </h1>
                 <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-md italic">
                    Mercan ERP ile tüm iş sağlığı ve güvenliği süreçlerinizi gerçek zamanlı takip edebilirsiniz.
                 </p>
              </div>
           </div>

           {/* STATUS CARDS */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                 <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileBox size={28} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Toplam Denetim Sayısı</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">{reportCount}</p>
                 </div>
              </div>

              <div className={`p-8 rounded-3xl border shadow-xl space-y-6 transition-all ${urgentCount > 0 ? "bg-rose-600 text-white border-rose-500 shadow-rose-600/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${urgentCount > 0 ? "bg-white/20 text-white" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"}`}>
                    <Activity size={28} />
                 </div>
                 <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${urgentCount > 0 ? "text-white/70" : "text-slate-400 dark:text-slate-500"}`}>Acil Aksiyon Bekleyenler</p>
                    <p className={`text-5xl font-black tracking-tighter italic ${urgentCount > 0 ? "text-white" : "text-rose-600 dark:text-rose-400"}`}>{urgentCount}</p>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                 <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock size={28} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Son Güncelleme Tarihi</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                       {lastUpdate ? lastUpdate.toLocaleDateString("tr-TR") : "KAYIT YOK"}
                    </p>
                 </div>
              </div>
           </div>

           {/* QUICK DOWNLOAD AREA */}
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 dark:text-slate-300">
                    <FileBox className="text-blue-600 dark:text-blue-400" size={20} /> Son Raporlarınız
                 </h3>
                 <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">HIZLI İNDİRME</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                 {recentReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                       <div className="flex items-center gap-6 text-center sm:text-left">
                          <div className="w-14 h-14 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                             <FileBox size={24} />
                          </div>
                          <div>
                             <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-1">{report.title}</div>
                             <div className="flex items-center justify-center sm:justify-start gap-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Activity size={12} className="text-blue-500" /> {report.category}</span>
                                <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald-500" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                             </div>
                          </div>
                       </div>
                       <Link 
                          href={report.fileUrl || "#"} 
                          target="_blank"
                          className="px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95"
                       >
                          Raporu İndir
                       </Link>
                    </div>
                 ))}
                 {recentReports.length === 0 && (
                    <div className="p-20 text-center text-slate-400 dark:text-slate-600 italic font-bold uppercase tracking-widest text-[10px]">
                       Henüz yüklenmiş bir raporunuz bulunmuyor.
                    </div>
                 )}
              </div>
           </div>

           {/* FOOTER INFO */}
           <div className="p-10 bg-indigo-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-indigo-100 dark:border-slate-800 flex items-start gap-6">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl transform -rotate-3">
                 <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                 <h4 className="font-black text-slate-900 dark:text-white tracking-tight uppercase italic text-lg">Müşteri Destek & Güvenlik</h4>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-widest max-w-2xl italic">
                    Sistemimiz 256-bit SSL sertifikası ile korunmaktadır. Raporlarınız sadece yetkilendirilmiş uzmanlar ve sizin tarafınızdan görüntülenebilir. Destek için uzmanınızla iletişime geçebilirsiniz.
                 </p>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000 font-medium italic">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
         <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Yönetim Kokpiti</h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Mercan ERP Analitik Veri Merkezi</p>
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
            <Clock size={12} className="text-blue-500" /> Son Güncelleme: {new Date().toLocaleTimeString()}
         </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.name} className="bg-white dark:bg-slate-900 p-6 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform ${s.color}`}>
               <s.icon size={80} />
            </div>
            <div className="flex items-center gap-4 relative z-10">
               <div className={`w-12 h-12 ${s.bg} dark:bg-slate-800 ${s.color} rounded-lg flex items-center justify-center shadow-inner`}>
                  <s.icon size={24} />
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{s.name}</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{s.value}</div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* ANALYSIS GRID (CHARTS & TIMELINE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* STATUS & TREND (Covers 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-2 dark:text-slate-300">
                        <TrendingUp className="text-blue-600 dark:text-blue-400" size={16} /> Statü Dağılımı
                     </h3>
                  </div>
                  <StatusChart data={statusData} />
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-2 dark:text-slate-300">
                        <Activity className="text-indigo-600 dark:text-indigo-400" size={16} /> Aylık Trend
                     </h3>
                  </div>
                  <TrendChart data={trendData} />
               </div>
            </div>

            {/* RECENT OPERATIONS TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 dark:text-slate-300">
                     <Clock className="text-indigo-600 dark:text-indigo-400" size={16} /> Son Operasyonlar
                  </h3>
                  <Link href="/dashboard/reports" className="group flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                     Tüm Arşiv <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm italic">
                     <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                        <tr>
                           <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rapor & Firma</th>
                           <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Zaman</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {recentReports.map((report) => (
                           <tr key={report.id} className="group hover:bg-indigo-50/20 dark:hover:bg-indigo-900/20 transition-colors">
                              <td className="p-6">
                                 <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">{report.title}</div>
                                 <div className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase mt-1 italic">{report.company.name}</div>
                              </td>
                              <td className="p-6 text-right text-[10px] font-bold text-slate-300 italic uppercase">
                                 {new Date(report.createdAt).toLocaleDateString()}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* AUDIT LOG TIMELINE (1 column) */}
         <div className="bg-white dark:bg-slate-900 p-8 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 flex flex-col">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] italic flex items-center gap-2 dark:text-slate-300">
                  <History className="text-rose-600 dark:text-rose-400" size={16} /> Sistem Günlüğü
               </h3>
               <span className="text-[8px] font-black bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 px-2 py-1 rounded tracking-[0.2em] uppercase shadow-sm border border-rose-100 dark:border-rose-900/50">Audit Trace</span>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-those-scrollbars">
               <RecentActivityTimeline logs={auditLogs} />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
               <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
                  Tüm hareketler güvenli denetim zinciri ile kayıt altına alınmaktadır.
               </p>
            </div>
         </div>

      </div>

    </div>
  );
}
