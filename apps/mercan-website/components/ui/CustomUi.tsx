"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  title: string;
  content: string | React.ReactNode;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div 
          key={i} 
          className={`border rounded-3xl overflow-hidden transition-all duration-500 ${
            openIndex === i ? "border-blue-600/30 bg-blue-50/20 shadow-xl shadow-blue-600/5" : "border-slate-100 bg-white"
          }`}
        >
          <button 
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full p-8 flex items-center justify-between text-left group"
          >
            <span className={`text-lg font-black uppercase italic tracking-tighter transition-colors ${
              openIndex === i ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
            }`}>
              {item.title}
            </span>
            <ChevronDown 
              className={`text-slate-400 transition-transform duration-500 ${openIndex === i ? "rotate-180 text-blue-600" : ""}`} 
              size={24} 
            />
          </button>
          
          <div 
            className={`transition-all duration-500 ease-in-out ${
              openIndex === i ? "max-h-[500px] opacity-100 py-8 px-8 pt-0 border-t border-blue-600/10" : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="text-slate-500 leading-relaxed font-medium italic prose prose-slate max-w-none">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { label: string, content: React.ReactNode }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 overflow-hidden">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeIndex === i 
                ? "bg-slate-900 text-white shadow-xl" 
                : "text-slate-400 hover:text-slate-600 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tabs[activeIndex].content}
      </div>
    </div>
  );
}
