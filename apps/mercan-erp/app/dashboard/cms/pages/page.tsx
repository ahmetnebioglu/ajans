"use client";

import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Plus, 
  Search, 
  FileText, 
  Settings2, 
  ExternalLink,
  ChevronLeft,
  Loader2,
  MoreVertical,
  Edit3,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { getPages, createPage, deletePage } from "../../../actions/cms-actions";

export default function PagesManagementPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadPages = async () => {
    setLoading(true);
    const data = await getPages();
    setPages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
    
    // Dropdown kapanması için dışarı tıklandığında eventi
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCreate = async () => {
    const res = await createPage(newPage.title, newPage.slug);
    if (res.success) {
      setIsCreateModalOpen(false);
      setNewPage({ title: "", slug: "" });
      loadPages();
    } else {
      alert(res.error || "Hata oluştu.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" sayfasını ve tüm içeriklerini silmek istediğinize emin misiniz?`)) return;
    
    setLoading(true);
    const res = await deletePage(id);
    if (res.success) {
      loadPages();
    } else {
      alert(res.error || "Silinirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-medium italic">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <Link href="/dashboard/cms" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-[9px] font-black uppercase tracking-widest mb-1 group">
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> CMS Hub
           </Link>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Sayfa <span className="text-emerald-600">Yönetimi</span>
           </h1>
           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
              Web sitesi sayfalarını ve bölüm yapılarını modüler olarak kurgulayın
           </p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95"
        >
           <Plus size={16} /> Yeni Sayfa
        </button>
      </div>

      {/* Page Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {loading ? (
           <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-emerald-600" size={28} />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Sayfalar Hazırlanıyor...</p>
           </div>
         ) : pages.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[4px]">
               <Layout className="mx-auto mb-4 text-slate-200 dark:text-slate-800" size={40} />
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Henüz sayfa oluşturulmadı.</p>
            </div>
         ) : (
           pages.map((page) => (
             <div key={page.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[4px] hover:shadow-sm transition-all duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start mb-5">
                   <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-[4px] flex items-center justify-center border border-emerald-500/10">
                      <Layout size={20} />
                   </div>
                   <div className="relative">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setOpenMenuId(openMenuId === page.id ? null : page.id);
                       }}
                       className="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-[4px]"
                     >
                        <MoreVertical size={16} />
                     </button>
                     {openMenuId === page.id && (
                       <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-900 rounded-[4px] shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-10 animate-in fade-in slide-in-from-top-2">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDelete(page.id, page.title);
                           }}
                           className="w-full px-3 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                         >
                           <Trash2 size={14} /> Sayfayı Sil
                         </button>
                       </div>
                     )}
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight group-hover:text-emerald-600 transition-colors">
                         {page.title}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
                         /{page.slug}
                      </p>
                   </div>

                   <div className="flex items-center gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
                      <div className="text-center flex-1">
                         <div className="text-base font-black text-slate-900 dark:text-white">{page._count.sections}</div>
                         <div className="text-[7px] font-black uppercase tracking-widest text-slate-400">Bölüm</div>
                      </div>
                      <div className="w-px h-6 bg-slate-100 dark:bg-slate-800" />
                      <div className="text-center flex-1">
                         <div className="text-[9px] font-black text-emerald-600">AKTİF</div>
                         <div className="text-[7px] font-black uppercase tracking-widest text-slate-400">Durum</div>
                      </div>
                   </div>

                   <div className="pt-1 flex gap-2">
                      <Link 
                        href={`/dashboard/cms/pages/${page.id}`}
                        className="flex-1 px-3 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-[4px] text-[8px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                      >
                         <Edit3 size={12} /> Düzenle
                      </Link>
                      <button className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[4px] hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-700">
                         <ExternalLink size={14} />
                      </button>
                   </div>
                </div>
             </div>
           ))
         )}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
           <div className="relative w-full max-w-sm bg-white dark:bg-slate-950 rounded-[4px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-5">Yeni Sayfa</h2>
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sayfa Başlığı</label>
                    <input 
                      type="text" 
                      value={newPage.title}
                      onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[4px] text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                      placeholder="Örn: Hakkımızda"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={newPage.slug}
                      onChange={(e) => setNewPage({...newPage, slug: e.target.value})}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[4px] text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                      placeholder="hakkimizda"
                    />
                 </div>
                 <button 
                   onClick={handleCreate}
                   className="w-full py-4 bg-emerald-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 mt-2 hover:bg-emerald-700 transition-colors"
                 >
                    SAYFAYI OLUŞTUR
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
