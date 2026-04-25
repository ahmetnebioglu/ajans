"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, BrainCircuit } from "lucide-react";
import { chatWithAi } from "../../actions/ai-actions";

export function AiInsight() {
  const [input, setInput] = useState("");
  const [elements, setElements] = useState<React.ReactNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await chatWithAi(input);
      
      if (!result.success) {
        setElements(prev => [...prev, <p key={Date.now()} className="text-xs text-rose-500 font-bold uppercase italic">{result.error}</p>]);
      } else {
        setElements(prev => [...prev, result.data]);
      }
      
      setInput("");
    } catch (error) {
      console.error("AI Insight Error:", error);
      setElements(prev => [...prev, <p className="text-xs text-rose-500 font-bold uppercase italic">Bir hata oluştu.</p>]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 dark:text-slate-300">
          <Sparkles className="text-blue-600 dark:text-blue-400" size={14} /> AI Analiz & Öngörü
        </h3>
        <div className="flex items-center gap-1.5">
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Canlı Sistem Bağlı</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {elements.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-[4px] rotate-3">
              <BrainCircuit size={40} className="text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analiz Başlatın</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase italic max-w-[200px]">
                "Bu ayki rapor trendlerini göster" veya "Kurumsal verileri karşılaştır" gibi sorular sorabilirsiniz.
              </p>
            </div>
          </div>
        )}
        
        {elements.map((element, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {element}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600 animate-pulse">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Veriler İşleniyor...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/30 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sisteme bir soru sorun..."
            className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[2px] px-4 py-3 text-xs font-bold italic placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all pr-12 shadow-inner uppercase tracking-tighter"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
