"use client";

import React, { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";

export function TableOfContents() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Sayfadaki h2 ve h3 başlıklarını tara
    const elements = Array.from(document.querySelectorAll("h2, h3"))
      .map((el) => {
        // Eğer ID yoksa metinden oluştur
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/\s+/g, "-") || "";
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: Number(el.tagName.replace("H", ""))
        };
      });
    setHeadings(elements);

    // Scroll takibi
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    document.querySelectorAll("h2, h3").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-32 space-y-6">
      <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
        <List size={20} className="text-blue-600" />
        <h3 className="text-lg font-black uppercase italic tracking-tighter">İçindekiler</h3>
      </div>
      
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1.5}rem` }}
          >
            <a 
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all group ${
                activeId === heading.id ? "text-blue-600 translate-x-2" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ChevronRight size={12} className={activeId === heading.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"} />
              {heading.text}
            </a>
          </li>
        ))}
      </ul>

      <div className="pt-8 border-t border-slate-100">
         <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] space-y-4 shadow-xl shadow-blue-600/20">
            <h4 className="text-lg font-black uppercase italic tracking-tighter leading-tight">Uzman Desteği İster Misiniz?</h4>
            <p className="text-[10px] font-bold text-blue-100 leading-relaxed">Bu konudaki tüm yasal süreçleriniz için profesyonel danışmanlık sağlıyoruz.</p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">TEKLİF ALIN</button>
         </div>
      </div>
    </nav>
  );
}
