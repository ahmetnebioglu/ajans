"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  HeartPulse, 
  Truck, 
  Factory, 
  HardHat, 
  Wrench, 
  Zap, 
  ChefHat, 
  ShoppingCart, 
  GraduationCap 
} from "lucide-react";

const STATIC_SECTORS = [
  { id: 1, title: 'İnşaat & Yapı', icon: Building2, desc: 'Şantiye ve proje sahalarında tam kapsamlı İSG denetimi.' },
  { id: 2, title: 'Sağlık', icon: HeartPulse, desc: 'Hastane ve kliniklerde proaktif risk yönetimi.' },
  { id: 3, title: 'Lojistik', icon: Truck, desc: 'Taşımacılık ve depolama süreçlerinde uluslararası güvenlik.' },
  { id: 4, title: 'Metal Sanayi', icon: Factory, desc: 'Ağır sanayi tesislerinde sıfır iş kazası hedefi.' },
  { id: 5, title: 'Madencilik', icon: HardHat, desc: 'Yüksek riskli sahalarda 7/24 kesintisiz güvenlik.' },
  { id: 6, title: 'Otomotiv', icon: Wrench, desc: 'Üretim bantlarında ergonomi ve personel güvenliği.' },
  { id: 7, title: 'Enerji', icon: Zap, desc: 'Santral ve enerji hatlarında periyodik teknik kontrol.' },
  { id: 8, title: 'Gıda & Tarım', icon: ChefHat, desc: 'Gıda güvenliği ve hijyen standartlarına tam uyum.' },
  { id: 9, title: 'Perakende', icon: ShoppingCart, desc: 'Mağaza zincirlerinde acil durum planlaması ve tahliye.' },
  { id: 10, title: 'Eğitim', icon: GraduationCap, desc: 'Okul ve kampüslerde güvenli yaşam alanlarının tesisi.' },
];

export default function SectorCarousel() {
  // Sonsuz döngü için listeyi ikiye katlıyoruz
  const doubledSectors = [...STATIC_SECTORS, ...STATIC_SECTORS];

  return (
    <div className="relative w-full overflow-hidden py-8 -my-8">
      {/* Sol ve Sağ Geçiş Yumuşatma (Fading Edges) */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <motion.div 
        className="flex gap-8"
        animate={{ 
          x: [0, "-50%"] // Yarısına kadar kaydırıp başa dönecek (sonsuz hissi)
        }}
        transition={{ 
          duration: 40, 
          ease: "linear", 
          repeat: Infinity 
        }}
        style={{ width: "fit-content" }}
      >
        {doubledSectors.map((sector, idx) => (
          <div 
            key={`${sector.id}-${idx}`} 
            className="w-[300px] flex-shrink-0 bg-white border border-slate-100 rounded-[1.25rem] p-8 text-center space-y-4 shadow-sm hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)] transition-all duration-500 group hover:-translate-y-2 mb-8"
          >
            <sector.icon className="w-16 h-16 mx-auto text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 text-center mb-2 uppercase italic tracking-tighter">
                {sector.title}
              </h3>
              <p className="text-center text-gray-500 text-[10px] font-medium italic leading-relaxed">
                {sector.desc}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
