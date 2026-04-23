"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, AlertTriangle, ShieldCheck, Flame, ChevronLeft, ChevronRight } from "lucide-react";

interface NaceCode {
  id: string;
  code: string;
  description: string;
  hazardClass: string;
}

export default function NaceSearch({ initialData }: { initialData: NaceCode[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHazard, setSelectedHazard] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Performans için arama ve filtreleme sonuçlarını memoize ediyoruz
  const filteredData = useMemo(() => {
    let result = initialData;
    
    if (selectedHazard) {
      result = result.filter(item => {
        const cls = item.hazardClass.toUpperCase();
        return cls.includes(selectedHazard.toUpperCase());
      });
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => 
        item.code.toLowerCase().includes(lowerSearch) || 
        item.description.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [searchTerm, selectedHazard, initialData]);

  // GTM Event Tracking with Debounce
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "search_nace_code",
            search_term: searchTerm,
            results_count: filteredData.length,
          });
        }
      }, 1000); // 1 saniye bekle (kullanıcı yazmayı bitirsin)
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filteredData.length]);

  // Sayfalama (Pagination)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getHazardBadge = (hazardClass: string) => {
    const cls = hazardClass.toUpperCase();
    if (cls.includes("ÇOK TEHLİKELİ") || cls.includes("COK TEHLIKELI")) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200 whitespace-nowrap">
          <Flame size={12} /> Çok Tehlikeli
        </span>
      );
    } else if (cls.includes("AZ TEHLİKELİ") || cls.includes("AZ TEHLIKELI")) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 whitespace-nowrap">
          <ShieldCheck size={12} /> Az Tehlikeli
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 whitespace-nowrap">
          <AlertTriangle size={12} /> Tehlikeli
        </span>
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Search Input */}
      <div className="relative group shadow-2xl shadow-blue-900/5 rounded-3xl">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-16 pr-6 py-6 bg-white border-none rounded-3xl text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
          placeholder="NACE Kodu, sektör adı veya tehlike sınıfı arayın..."
          value={searchTerm}
          onChange={(e) => {
             setSearchTerm(e.target.value);
             setCurrentPage(1); // Aramada ilk sayfaya dön
          }}
        />
      </div>

      {/* Hazard Class Quick Filters */}
      <div className="flex flex-wrap items-center gap-3 px-2">
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Hızlı Filtre:</span>
         {[
           { label: "Az Tehlikeli", icon: ShieldCheck, active: "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20", hover: "hover:border-emerald-300 hover:text-emerald-600" },
           { label: "Tehlikeli", icon: AlertTriangle, active: "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20", hover: "hover:border-amber-300 hover:text-amber-600" },
           { label: "Çok Tehlikeli", icon: Flame, active: "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20", hover: "hover:border-rose-300 hover:text-rose-600" },
         ].map((filter) => (
           <button
             key={filter.label}
             onClick={() => {
                setSelectedHazard(selectedHazard === filter.label ? null : filter.label);
                setCurrentPage(1);
             }}
             className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                selectedHazard === filter.label
                  ? `${filter.active} scale-105`
                  : `bg-white text-slate-500 border-slate-100 ${filter.hover}`
             }`}
           >
             <filter.icon size={14} />
             {filter.label}
           </button>
         ))}
         {selectedHazard && (
           <button 
             onClick={() => {
               setSelectedHazard(null);
               setCurrentPage(1);
             }}
             className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline px-2"
           >
             Temizle
           </button>
         )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-50">
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Toplam <span className="text-blue-600 font-black">{filteredData.length}</span> kayıt bulundu
         </p>
      </div>

      {/* Data Table / List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32">NACE Kodu</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">İş Tanımı</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-48">Tehlike Sınıfı</th>
                  </tr>
               </thead>
               <tbody>
                  {currentData.length > 0 ? (
                     currentData.map((item) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                           <td className="p-5 font-black text-slate-900 text-sm whitespace-nowrap">{item.code}</td>
                           <td className="p-5 text-sm font-medium text-slate-600 leading-relaxed">{item.description}</td>
                           <td className="p-5 text-right flex justify-end">{getHazardBadge(item.hazardClass)}</td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={3} className="p-16 text-center text-slate-400 font-bold italic">
                           Aradığınız kritere uygun sonuç bulunamadı.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
         <div className="flex items-center justify-center gap-2 pt-4">
            <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
            >
               <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
               Sayfa {currentPage} / {totalPages}
            </span>
            <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages}
               className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
            >
               <ChevronRight size={18} />
            </button>
         </div>
      )}
    </div>
  );
}
