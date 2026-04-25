"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, BrainCircuit } from "lucide-react";
import { chatWithAi } from "../lib/actions/ai-actions";

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
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-white dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[500px]">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} />
           </div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white leading-none">Akıllı Asistan</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Eğitim Analitiği</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        {elements.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem]">
              <BrainCircuit size={48} className="text-indigo-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Nasıl yardımcı olabilirim?</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase italic max-w-[240px] leading-relaxed">
                "İzin taleplerini kategorize et" veya "Bu haftaki öğrenci devamsızlık trendini göster" diyebilirsiniz.
              </p>
            </div>
          </div>
        )}
        
        {elements.map((element, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {element}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-3 text-indigo-600 animate-pulse bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-2xl w-fit">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Zeka İşleniyor...</span>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50/30 dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Asistana soru sorun..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold italic placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-14 shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
