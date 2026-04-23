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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
            HİZMET YÖNETİMİ
          </h1>
          <p className="text-sm text-slate-500 font-medium italic">
            Web sitesindeki hizmet sayfalarını buradan yönetebilirsiniz.
          </p>
        </div>
        <Link
          href="/dashboard/cms/services/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} />
          YENİ HİZMET EKLE
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Sıra</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Hizmet Adı</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">URL (Slug)</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800">Durum</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {service.order}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {service.title}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      /{service.slug}
                    </td>
                    <td className="p-4">
                      {service.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <a
                        href={`http://localhost:3000/hizmetlerimiz/${service.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Önizle"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <Link
                        href={`/dashboard/cms/services/${service.id}`}
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
