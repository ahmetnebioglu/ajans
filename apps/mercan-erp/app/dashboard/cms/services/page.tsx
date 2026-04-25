"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getServices, deleteService } from "../../../actions/service-actions";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    
    setLoading(true);
    try {
      const res = await deleteService(id);
      if (res.success) {
        setServices(services.filter((s) => s.id !== id));
      } else {
        alert("Silme başarısız: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-medium italic">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            HİZMET <span className="text-emerald-600">YÖNETİMİ</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Web sitesindeki hizmet sayfalarını buradan yönetebilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4px] text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all shadow-sm"
            />
          </div>
          <Link
            href="/dashboard/cms/services/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-[4px] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <Plus size={16} />
            YENİ HİZMET EKLE
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[4px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 italic">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Hizmet Listesi</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest italic border-b border-slate-200 dark:border-slate-800">
              <th className="p-4">Sıra</th>
              <th className="p-4">Hizmet Adı</th>
              <th className="p-4">URL (Slug)</th>
              <th className="p-4">Durum</th>
              <th className="p-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-slate-400 text-[11px] font-black uppercase tracking-widest italic">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredServices.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-slate-400 text-[11px] font-black uppercase tracking-widest italic">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 font-black text-slate-900 dark:text-white text-xs">
                    {service.order}
                  </td>
                  <td className="p-4 font-black text-slate-900 dark:text-white text-xs uppercase italic tracking-tighter">
                    {service.title}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-500 text-[11px] font-bold">
                    /{service.slug}
                  </td>
                  <td className="p-4">
                    {service.isPublished ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Taslak
                      </span>
                    )}
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <a
                      href={`http://localhost:3000/hizmetlerimiz/${service.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-300 dark:text-slate-700 hover:text-emerald-600 transition-colors"
                      title="Önizle"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <Link
                      href={`/dashboard/cms/services/${service.id}`}
                      className="p-2 text-slate-300 dark:text-slate-700 hover:text-emerald-600 transition-colors"
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-300 dark:text-slate-700 hover:text-red-600 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
