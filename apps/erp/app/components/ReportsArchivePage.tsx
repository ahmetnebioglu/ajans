"use client";

import React, { useState, useEffect } from "react";
import {
  FileBox,
  Search,
  ArrowUpDown,
  ExternalLink,
  Eye,
  Tag,
  User as UserIcon,
  Building2,
  Calendar,
  Clock,
  Loader2,
  Filter,
  ArrowRight,
  Maximize2,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FilePreview from "./dashboard/FilePreview";

export default function ReportsArchivePage({
  reports: initialReports,
}: {
  reports: any[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [previewFile, setPreviewFile] = useState<any>(null);

  // SEARCH LOGIC (DEBOUNCED)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) params.set("q", searchTerm);
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sort");
    const currentDir = params.get("dir");

    if (currentSort === field) {
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("dir", "asc");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "AKSIYON_GEREKLI":
        return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
      case "COZULDU":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
      default:
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 font-medium italic">
      {/* QUICK LOOK MODAL */}
      <FilePreview
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      {/* HEADER & SEARCH SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white dark:bg-slate-900 p-10 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <FileBox className="absolute -right-12 -bottom-12 text-slate-50 dark:text-slate-800/10 w-80 h-80 -rotate-12" />

        <div className="space-y-4 relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-xl transform -rotate-6">
              <FileBox size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                Rapor Arşivi
              </h1>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-1 italic">
                TÜM FİRMALARIN DİJİTAL EVRAK MERKEZİ
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-96 relative z-10 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Rapor başlığı veya firma ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ARCHIVE TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort("title")}
                  className="p-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2rem]">
                    <FileBox size={14} /> Rapor Adı <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("workspaceId")}
                  className="p-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2rem]">
                    <Building2 size={14} /> Firma <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-6 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2rem]">
                    <Tag size={14} /> Kategori & Durum
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="p-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2rem]">
                    <Clock size={14} /> Tarih <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-6 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2rem]">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 italic">
              {initialReports.map((report) => (
                <tr
                  key={report.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-300"
                >
                  <td
                    className="p-6 cursor-pointer"
                    onClick={() => setPreviewFile(report)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                        <Eye size={18} />
                      </div>
                      <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {report.title}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block border border-blue-100 dark:border-blue-900/50">
                      {report.workspace.name}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase flex items-center gap-1">
                        <Tag size={10} /> {report.category}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(report.status)}`}
                      >
                        {report.status.replace("_", " ")}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">
                      {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                    </div>
                    <div className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase">
                      {report.uploadedBy.name}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewFile(report)}
                        className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        GÖZ AT
                      </button>
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white transition-all shadow-sm"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {initialReports.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="text-4xl font-black text-slate-200 uppercase tracking-tighter opacity-10 italic">
                Arşiv Boş
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                ARAMA KRİTERLERİNİZE UYGUN RAPOR BULUNAMADI
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
