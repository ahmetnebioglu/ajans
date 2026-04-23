"use client";

import React, { useState } from "react";
import { Search, Shield, AlertTriangle, Info, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NACE_DATA = [
  { code: "01.11.07", name: "Tahıl yetiştiriciliği (pirinç hariç)", level: "AZ_TEHLIKELI" },
  { code: "10.11.01", name: "Et ürünlerinin imalatı", level: "TEHLIKELI" },
  { code: "25.11.07", name: "Metal yapı ve yapı parçaları imalatı", level: "COK_TEHLIKELI" },
  { code: "41.20.02", name: "İkamet amaçlı olmayan binaların inşaatı", level: "COK_TEHLIKELI" },
  { code: "47.11.01", name: "Bakkal ve marketlerde yapılan perakende ticaret", level: "AZ_TEHLIKELI" },
  { code: "56.10.08", name: "Restoran ve lokantaların faaliyetleri", level: "AZ_TEHLIKELI" },
  { code: "62.01.01", name: "Bilgisayar programlama faaliyetleri", level: "AZ_TEHLIKELI" },
];

export function NaceCodeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof NACE_DATA>([]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 3) {
      setResults([]);
      return;
    }
    const filtered = NACE_DATA.filter(item => 
      item.name.toLowerCase().includes(val.toLowerCase()) || 
      item.code.includes(val)
    );
    setResults(filtered);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "AZ_TEHLIKELI":
        return <span className="px-3 py-1 bg-blue-50 text-corporate-blue rounded-md text-[9px] font-bold uppercase tracking-widest border border-blue-100">Az Tehlikeli</span>;
      case "TEHLIKELI":
        return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-md text-[9px] font-bold uppercase tracking-widest border border-orange-100">Tehlikeli</span>;
      case "COK_TEHLIKELI":
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-md text-[9px] font-bold uppercase tracking-widest border border-rose-100">Çok Tehlikeli</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-corporate-blue transition-colors" size={20} />
        <Input 
          type="text" 
          placeholder="Sektörünüzü veya NACE kodunuzu yazın..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 py-6 rounded-md border-slate-200 focus:ring-corporate-blue/10"
        />
      </div>

      <div className="space-y-3 min-h-[200px]">
        {results.map((item, i) => (
          <div key={i} className="p-4 bg-white rounded-md border border-slate-100 flex items-center justify-between gap-4 hover:border-corporate-blue/20 transition-all group animate-in fade-in slide-in-from-bottom-1">
             <div className="space-y-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NACE: {item.code}</div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-corporate-blue transition-colors">{item.name}</h4>
             </div>
             <div className="shrink-0">
                {getLevelBadge(item.level)}
             </div>
          </div>
        ))}

        {query.length >= 3 && results.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs italic font-medium">
             Eşleşen sonuç bulunamadı.
          </div>
        )}

        {query.length < 3 && (
          <div className="py-12 text-center text-slate-400 text-xs italic font-medium opacity-50">
             Aramaya başlamak için en az 3 karakter girin.
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 rounded-md text-white space-y-4">
         <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-tight italic">Bültene Abone Olun</h4>
            <p className="text-[10px] text-slate-400 font-medium">Güncel İSG mevzuat değişiklikleri anında e-postanıza gelsin.</p>
         </div>
         <div className="flex gap-2">
            <Input type="email" placeholder="E-posta adresiniz" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-md h-10" />
            <Button size="icon" className="bg-corporate-blue hover:bg-slate-800 shrink-0">
               <ArrowRight size={18} />
            </Button>
         </div>
      </div>
    </div>
  );
}
