import ReportWizard from "../../components/ReportWizard";
import { LayoutGrid, Cloud } from "lucide-react";

export default function DrivePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Modern Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight text-sm uppercase">
              <Cloud size={16} />
              Google Cloud Arşivi
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Saha Raporları
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              Saha uzmanları için tasarlanmış, anlık veri senkronizasyonlu rapor yükleme merkezi.
            </p>
          </div>
          
          <div className="hidden sm:flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2">
              <LayoutGrid size={16} /> Dashboard Görünümü
            </button>
          </div>
        </div>

        {/* The Wizard Component */}
        <ReportWizard />

        {/* Quick Help / Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12">
           <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Otomatik Arşivle
              </h3>
              <p className="text-sm text-slate-500">Yüklediğiniz her dosya Mercan ERP'nin güvenli Drive klasörüne anında aktarılır.</p>
           </div>
           <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Mobil Uyumlu
              </h3>
              <p className="text-sm text-slate-500">Sahada tabletinizden veya telefonunuzdan fotoğraf çekip doğrudan yükleyebilirsiniz.</p>
           </div>
           <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Geriye Dönük İzleme
              </h3>
              <p className="text-sm text-slate-500">Merkez ofis yüklediğiniz raporları tarih ve proje bazlı anlık görüntüleyebilir.</p>
           </div>
        </div>
      </div>
    </main>
  );
}
