"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SearchInput({ 
  defaultValue = "", 
  placeholder = "Ara..." 
}: { 
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  
  // Arama işlemini URL ile senkronize etmek için ref kullanıyoruz (Sonsuz döngüyü önlemek için)
  const initialRender = useRef(true);

  useEffect(() => {
    // İlk render'da veya değer boşsa URL güncelleme
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Değer değişmediyse işlem yapma
    const currentQ = searchParams.get("q") || "";
    if (value === currentQ) {
       setIsSearching(false);
       return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      
      // Navigasyon bittiğinde animasyonu durdur
      const navTimer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(navTimer);
    }, 400); // 400ms Debounce

    return () => clearTimeout(timer);
  }, [value, pathname, router]); // searchParams bağımlılığını kaldırdık

  // URL manuel değişirse (Geri tuşu vb.) input değerini güncelle
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== value) {
      setValue(q);
    }
  }, [searchParams]);

  return (
    <div className="relative group">
       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-all">
          {isSearching ? (
             <Loader2 size={18} className="animate-spin text-blue-600" />
          ) : (
             <Search size={18} className="group-focus-within:scale-110 transition-transform" />
          )}
       </div>
       <input 
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-11 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white font-bold uppercase tracking-tight italic outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all shadow-sm"
       />
       {value && (
         <button 
           onClick={() => {
              setValue("");
              setIsSearching(true);
           }}
           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
         >
           <X size={16} />
         </button>
       )}
    </div>
  );
}
