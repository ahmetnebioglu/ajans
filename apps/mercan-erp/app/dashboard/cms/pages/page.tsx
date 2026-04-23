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
    <div className="p-8 space-y-8 animate-in fade-in duration-700 italic font-medium">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <Link href="/dashboard/cms" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-2 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> CMS Hub
           </Link>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Sayfa <span className="text-emerald-600">Yönetimi</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Web sitesi sayfalarını ve bölüm yapılarını modüler olarak kurgulayın
           </p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 flex items-center gap-3 hover:scale-105 transition-transform active:scale-95"
        >
           <Plus size={18} /> Yeni Sayfa Oluştur
        </button>
      </div>

      {/* Page Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
           <div className="col-span-full py-24 text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Sayfalar Hazırlanıyor...</p>
           </div>
         ) : pages.length === 0 ? (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
               <Layout className="mx-auto mb-4 text-slate-200" size={48} />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Henüz sayfa oluşturulmadı.</p>
            </div>
         ) : (
           pages.map((page) => (
             <div key={page.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Layout size={24} />
                   </div>
                   <div className="relative">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setOpenMenuId(openMenuId === page.id ? null : page.id);
                       }}
                       className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"
                     >
                        <MoreVertical size={18} />
                     </button>
                     {openMenuId === page.id && (
                       <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-10 animate-in fade-in slide-in-from-top-2">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDelete(page.id, page.title);
                           }}
                           className="w-full px-4 py-3 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                         >
                           <Trash2 size={16} /> Sayfayı Sil
                         </button>
                       </div>
                     )}
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight group-hover:text-emerald-600 transition-colors">
                         {page.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                         /{page.slug}
                      </p>
                   </div>

                   <div className="flex items-center gap-4 py-4 border-y dark:border-slate-800">
                      <div className="text-center flex-1">
                         <div className="text-lg font-black text-slate-900 dark:text-white">{page._count.sections}</div>
                         <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Bölüm</div>
                      </div>
                      <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                      <div className="text-center flex-1">
                         <div className="text-[10px] font-black text-emerald-600">AKTİF</div>
                         <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Durum</div>
                      </div>
                   </div>

                   <div className="pt-2 flex gap-2">
                      <Link 
                        href={`/dashboard/cms/pages/${page.id}`}
                        className="flex-1 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                      >
                         <Edit3 size={14} /> İçeriği Düzenle
                      </Link>
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-blue-600 transition-colors">
                         <ExternalLink size={16} />
                      </button>
                   </div>
                </div>
             </div>
           ))
         )}
      </div>

      {/* CREATE MODAL (Simple Placeholder) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-white/20">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Yeni Sayfa</h2>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sayfa Başlığı</label>
                    <input 
                      type="text" 
                      value={newPage.title}
                      onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                      placeholder="Örn: Hakkımızda"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={newPage.slug}
                      onChange={(e) => setNewPage({...newPage, slug: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all"
                      placeholder="hakkimizda"
                    />
                 </div>
                 <button 
                   onClick={handleCreate}
                   className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 mt-4"
                 >
                    Sayfayı Oluştur
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
