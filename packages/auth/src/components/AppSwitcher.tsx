"use client";

import React, { useState } from "react";
import { 
  LayoutGrid, 
  HardDrive, 
  Mail, 
  Globe, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";

const apps = [
  { 
    name: "DRIVE (BELGE)", 
    desc: "İSG & Doküman Arşivi",
    url: "http://localhost:3001/dashboard", 
    icon: HardDrive, 
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  { 
    name: "MAIL (İLETİŞİM)", 
    desc: "Kurumsal İleti Merkezi",
    url: "http://localhost:3002", 
    icon: Mail, 
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  { 
    name: "CMS (YÖNETİM)", 
    desc: "Web İçerik & Yayıncılık",
    url: "http://localhost:3003", 
    icon: Globe, 
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
];

export function AppSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative italic font-medium">
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-95 group"
      >
        <LayoutGrid size={20} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-14 left-0 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 p-6 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={18} className="text-blue-600" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">YETKİLİ MODÜLLER</h3>
            </div>

            <div className="space-y-2">
              {apps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className={`w-12 h-12 ${app.bg} ${app.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <app.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight flex items-center justify-between">
                      {app.name}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.desc}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                   MERKEZİ GİRİŞ (SSO) AKTİF <br /> TÜM HAKLARI MERCAN GRUP'A AİTTİR.
                </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
