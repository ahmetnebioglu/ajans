import ReportWizard from "../../components/ReportWizard";
import { LayoutGrid, Cloud } from "lucide-react";

export default function DrivePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Modern Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-black tracking-[0.2em] text-[10px] uppercase italic">
              <Cloud size={14} />
              Google Cloud Arşivi
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Saha <span className="text-blue-600">Raporları</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md text-sm italic">
              Saha uzmanları için tasarlanmış, anlık veri senkronizasyonlu rapor yükleme merkezi.
            </p>
          </div>
          
          <div className="hidden sm:flex bg-white dark:bg-zinc-900 p-1 rounded-[4px] shadow-sm border border-slate-200 dark:border-zinc-800">
            <button className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-[4px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
              <LayoutGrid size={14} /> DASHBOARD GÖRÜNÜMÜ
            </button>
          </div>
        </div>

        {/* The Wizard Component */}
        <ReportWizard />

        {/* Quick Help / Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12">
           {[
             { color: "bg-blue-500", title: "Otomatik Arşivle", desc: "Yüklediğiniz her dosya ERP'nin güvenli Drive klasörüne anında aktarılır.", iconColor: "text-blue-500" },
             { color: "bg-indigo-500", title: "Mobil Uyumlu", desc: "Sahada tabletinizden veya telefonunuzdan fotoğraf çekip doğrudan yükleyebilirsiniz.", iconColor: "text-indigo-500" },
             { color: "bg-purple-500", title: "Geriye Dönük İzleme", desc: "Merkez ofis yüklediğiniz raporları tarih ve proje bazlı anlık görüntüleyebilir.", iconColor: "text-purple-500" }
           ].map((item, i) => (
             <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50">
                <h3 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-xs uppercase italic tracking-tight">
                  <span className={`w-1.5 h-1.5 rounded-[4px] ${item.color} animate-pulse`} />
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}
