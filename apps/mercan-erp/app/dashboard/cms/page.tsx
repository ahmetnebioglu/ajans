"use client";

import React from "react";
import { 
  Globe, 
  FileBox, 
  Layout, 
  Settings, 
  Mail, 
  MessageSquare, 
  ChevronRight,
  Plus,
  Newspaper
} from "lucide-react";
import Link from "next/link";

const CMS_MODULES = [
  {
    title: "Sayfa Yönetimi",
    description: "Ana sayfa ve alt sayfaların içerik bölümlerini yönetin.",
    icon: Layout,
    href: "/dashboard/cms/pages",
    color: "bg-blue-500",
    stats: "4 Aktif Sayfa"
  },
  {
    title: "Blog & İçerik",
    description: "Haberler, duyurular ve makaleler yayınlayın.",
    icon: Newspaper,
    href: "/dashboard/cms/blog",
    color: "bg-emerald-500",
    stats: "12 Yazı"
  },
  {
    title: "İSG Kütüphanesi",
    description: "Müşterilerle paylaşılan teknik İSG dökümanlarını yönetin.",
    icon: FileBox,
    href: "/dashboard/cms/isg-library",
    color: "bg-indigo-500",
    stats: "Aktif"
  },
  {
    title: "NACE Kodları",
    description: "Tehlike sınıfları ve iş tanımları listesini güncelleyin.",
    icon: Layout,
    href: "/dashboard/cms/nace-codes",
    color: "bg-violet-500",
    stats: "Aktif"
  },
  {
    title: "Bülten & Mesajlar",
    description: "Abonelikler ve iletişim formu mesajlarını takip edin.",
    icon: MessageSquare,
    href: "/dashboard/cms/engagement",
    color: "bg-rose-500",
    stats: "3 Yeni Mesaj"
  },
  {
    title: "Site Ayarları",
    description: "Logo, adres, sosyal medya ve SEO yapılandırması.",
    icon: Settings,
    href: "/dashboard/cms/settings",
    color: "bg-amber-500",
    stats: "Global"
  }
];

export default function CMSPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 italic font-medium">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              CMS <span className="text-blue-600">HUB</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Kurumsal web sitesi ve dijital varlık yönetim merkezi
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
              <Globe size={14} /> Siteyi Görüntüle
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {CMS_MODULES.map((module) => (
           <Link 
             key={module.title}
             href={module.href}
             className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 relative overflow-hidden"
           >
              {/* Background Decoration */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${module.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
              
              <div className="space-y-6 relative z-10">
                 <div className={`w-14 h-14 ${module.color} text-white rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform`}>
                    <module.icon size={28} />
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                          {module.title}
                       </h3>
                       <span className="text-[10px] font-black uppercase text-slate-400 opacity-60">
                          {module.stats}
                       </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                       {module.description}
                    </p>
                 </div>

                 <div className="pt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Yönetmeye Başla <ChevronRight size={14} />
                 </div>
              </div>
           </Link>
         ))}

         {/* Quick Add Card */}
         <button className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-600/20 flex flex-col items-center justify-center gap-4 hover:scale-95 transition-transform group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
               <Plus size={32} />
            </div>
            <div className="text-center">
               <div className="font-black uppercase italic tracking-tighter text-lg">Hızlı İçerik</div>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Yeni Blog veya Döküman</div>
            </div>
         </button>
      </div>

      {/* Recent Activity Section placeholder */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">Dijital Varlıklarınız Güvende</h2>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Tüm içerikler Google Drive altyapısı ile senkronize çalışır.</p>
            </div>
            <div className="flex gap-4">
               <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[120px]">
                  <div className="text-2xl font-black text-blue-500">120+</div>
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-50">Toplam İçerik</div>
               </div>
               <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[120px]">
                  <div className="text-2xl font-black text-emerald-500">1.2k</div>
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-50">Aylık Ziyaret</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
