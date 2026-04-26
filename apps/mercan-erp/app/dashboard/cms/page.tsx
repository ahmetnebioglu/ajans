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
  Home,
  Newspaper,
  Building2,
  Send,
} from "lucide-react";
import Link from "next/link";

const CMS_MODULES = [
  {
    title: "Ana Sayfa Yönetimi",
    description: "Slider, öne çıkan bölümler ve karşılama metinlerini yönetin.",
    icon: Home,
    href: "/dashboard/cms/homepage",
    color: "bg-emerald-600",
    stats: "GÜNCEL",
  },
  {
    title: "Kurumsal Bilgiler",
    description: "Hakkımızda, vizyon ve misyon metinlerini düzenleyin.",
    icon: Building2,
    href: "/dashboard/cms/about",
    color: "bg-emerald-600",
    stats: "AKTİF",
  },
  {
    title: "Hizmet Yönetimi",
    description: "Kurumsal hizmetlerin detaylarını ve sıralamasını yönetin.",
    icon: Layout,
    href: "/dashboard/cms/services",
    color: "bg-emerald-600",
    stats: "8 HİZMET",
  },
  {
    title: "Blog & İçerik",
    description: "Sektörel makaleleri ve kurumsal haberleri yayınlayın.",
    icon: Newspaper,
    href: "/dashboard/cms/blog",
    color: "bg-emerald-600",
    stats: "AKTİF",
  },
  {
    title: "İSG Kütüphanesi",
    description: "Teknik döküman ve dosya arşivinizi düzenleyin.",
    icon: FileBox,
    href: "/dashboard/cms/isg-library",
    color: "bg-emerald-600",
    stats: "GÜVENLİ",
  },
  {
    title: "NACE Kodları",
    description: "Tehlike sınıfları ve NACE kod arşivini yönetin.",
    icon: Settings,
    href: "/dashboard/cms/nace-codes",
    color: "bg-emerald-600",
    stats: "LİSTE",
  },
  {
    title: "Gelen Talepler",
    description: "Web sitesinden gelen tüm form ve iletişim talepleri.",
    icon: MessageSquare,
    href: "/dashboard/cms/talepler",
    color: "bg-amber-600",
    stats: "YENİ",
  },
  {
    title: "Bülten & Mesajlar",
    description: "E-Bülten aboneleri ve sistem içi mesajlaşma.",
    icon: Send,
    href: "/dashboard/cms/newsletter",
    color: "bg-rose-600",
    stats: "MODÜL",
  },
  {
    title: "Site Ayarları",
    description: "SEO, Sosyal Medya ve API yapılandırmaları.",
    icon: Settings,
    href: "/dashboard/cms/settings",
    color: "bg-slate-600",
    stats: "SİSTEM",
  },
];

export default function CMSPage() {
  return (
    <div className="p-8 space-y-4 font-medium italic">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            CMS <span className="text-emerald-600">HUB</span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            Merkezi İçerik ve Dijital Varlık Kontrol Paneli
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-[4px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-sm active:scale-95 group"
          >
            <Globe
              size={14}
              className="text-emerald-600 group-hover:rotate-12 transition-transform"
            />{" "}
            SİTEYİ GÖRÜNTÜLE
          </Link>
        </div>
      </div>

      {/* System Status Header */}
      <div className="bg-slate-900 text-white p-8 rounded-[4px] border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-600/5 skew-x-12 translate-x-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-600/10 rounded-[4px] flex items-center justify-center border border-emerald-600/20 shadow-inner">
              <Settings
                size={28}
                className="text-emerald-500 animate-[spin_10s_linear_infinite]"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black italic uppercase tracking-tighter">
                Sistem Altyapısı <span className="text-emerald-500">Aktif</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
                Tüm modüller gerçek zamanlı bulut senkronizasyonuna sahip
              </p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-500 italic leading-none tracking-tighter">
                100%
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest opacity-40 dark:opacity-40 mt-1">
                Erişilebilirlik
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-500 italic leading-none tracking-tighter">
                V2.8
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest opacity-40 dark:opacity-40 mt-1">
                HUB Sürümü
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid - Aligned with Sidebar Menu (3/4 grid depending on count) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CMS_MODULES.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="group bg-slate-900 border border-slate-800 p-8 rounded-[4px] shadow-sm hover:shadow-md hover:border-emerald-600/50 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
          >
            <div className="space-y-6 relative z-10">
              <div
                className={`w-12 h-12 ${module.color} text-white rounded-[4px] flex items-center justify-center shadow-xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}
              >
                <module.icon size={22} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-emerald-600 transition-colors">
                    {module.title}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  {module.description}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                YÖNET <ChevronRight size={12} />
              </div>
              <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                {module.stats}
              </span>
            </div>

            {/* Decorative Background Icon */}
            <div className="absolute -right-6 -bottom-6 text-slate-50 dark:text-slate-800/10 group-hover:text-emerald-600/5 transition-all duration-700 group-hover:scale-125">
              <module.icon size={120} />
            </div>

            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-0 h-1 bg-emerald-600 group-hover:w-full transition-all duration-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
