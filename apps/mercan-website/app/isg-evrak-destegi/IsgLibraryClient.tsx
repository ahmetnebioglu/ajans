"use client";

import React, { useState } from "react";
import { 
  Search, 
  FileText, 
  Download, 
  BookOpen,
  SearchIcon,
  X,
  Sparkles
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  fileSize: string;
  fileUrl: string;
  description: string;
}

const DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "LPG Dolum İstasyonları Güvenlik Talimatı",
    category: "İSG Talimatları",
    type: "PDF",
    fileSize: "1.2 MB",
    fileUrl: "/docs/lpg-guvenlik.pdf",
    description: "LPG dolum ve boşaltım işlemleri sırasında uyulması gereken emniyet kuralları."
  },
  {
    id: "2",
    title: "Güvenli Sürüş Teknikleri El Kitabı",
    category: "Eğitim Dökümanları",
    type: "PDF",
    fileSize: "4.5 MB",
    fileUrl: "/docs/guvenli-surus.pdf",
    description: "Şirket araçlarını kullanan personel için temel güvenli sürüş prensipleri."
  },
  {
    id: "3",
    title: "Yüksekte Çalışma İSG Soruları",
    category: "İSG Eğitim Soruları",
    type: "PDF",
    fileSize: "0.8 MB",
    fileUrl: "/docs/yuksekte-calisma-sorular.pdf",
    description: "Yüksekte çalışma eğitimleri sonrası yapılacak değerlendirme sınavı soru bankası."
  },
  {
    id: "4",
    title: "Ofislerde Ergonomi Rehberi",
    category: "İSG Talimatları",
    type: "PDF",
    fileSize: "2.1 MB",
    fileUrl: "/docs/ofis-ergonomi.pdf",
    description: "Ekranlı araçlarla çalışanlar için duruş ve ofis düzenleme klavuzu."
  }
];

const CATEGORIES = ["Tümü", "İSG Talimatları", "İSG Eğitim Soruları", "Eğitim Dökümanları", "İSG Videoları"];

export default function IsgLibraryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");

  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Tümü" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Hero Section - Ultimate Glass Theme (#0F172A) */}
      <section className="bg-[#0F172A] py-24 relative overflow-hidden text-center">
        
        {/* Arka Planı İkiye Bölen Çizgi (Z-index: 0) */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[55%] h-full bg-teal-500/[0.08] skew-x-[-20deg] origin-top border-l border-white/[0.05] shadow-[-20px_0_100px_rgba(20,184,166,0.05)]" />
        </div>

        {/* Global Glow */}
        <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10 space-y-8 flex flex-col items-center">
           {/* Label Style Sync */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-teal-500/20 rounded-full bg-teal-500/5">
              <Sparkles size={12} className="text-teal-400" />
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] italic">
                &lt;İSG DÖKÜMANLARI & MEVZUAT&gt;
              </span>
           </div>

           <h1 className="text-5xl md:text-6xl font-black text-teal-400 tracking-tighter uppercase italic leading-[0.9]">
             İSG <span className="text-white">KÜTÜPHANESİ</span>
           </h1>

           <p className="text-gray-200 text-base md:text-lg font-medium italic max-w-2xl mx-auto opacity-80 leading-relaxed">
             Güncel mevzuat ve İSG dökümanlarına modern ve hızlı erişim.
           </p>

           {/* PREMIUM GLASS SEARCH INPUT */}
           <div className="w-full max-w-2xl relative group mt-4">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="text-teal-200/40 group-focus-within:text-teal-400 transition-all duration-300" size={22} />
              </div>
              <input 
                type="text" 
                placeholder="Neyi aramıştınız?..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl text-teal-50 text-base font-bold outline-none focus:ring-8 focus:ring-teal-500/5 focus:border-teal-400/30 transition-all duration-500 placeholder:text-teal-200/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-8 flex items-center text-teal-200/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
           </div>
        </div>
      </section>

      {/* Main Content Area - Aydınlık Tema Geçişi */}
      <section className="py-16 bg-white flex-1">
        <div className="container-wide">
          {/* Filtering */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? "bg-teal-600 text-white shadow-xl shadow-teal-600/20" 
                  : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full py-24 text-center space-y-4">
                 <SearchIcon className="mx-auto text-slate-200" size={64} />
                 <p className="text-slate-400 font-black uppercase tracking-widest italic text-sm">Aradığınız kriterlerde döküman bulunamadı.</p>
              </div>
            ) : filteredDocs.map((doc) => (
              <div key={doc.id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:border-teal-500/20 transition-all duration-500 flex flex-col md:flex-row gap-8">
                 <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-teal-600/5">
                    <FileText size={32} />
                 </div>
                 
                 <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                       <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight group-hover:text-teal-600 transition-colors">
                          {doc.title}
                       </h3>
                       <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md uppercase tracking-widest">
                          {doc.type}
                       </span>
                    </div>
                    
                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed line-clamp-2">
                       {doc.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <BookOpen size={14} className="text-teal-500" /> {doc.category}
                       </div>
                       <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/5">
                          <Download size={14} /> İNDİR ({doc.fileSize})
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
