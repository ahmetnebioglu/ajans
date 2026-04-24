"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, BarChart3 } from "lucide-react";
import { streamCrmInsights } from "./ai-actions";
import { readStreamableValue } from "@ai-sdk/rsc";

export default function AiDashboard() {
  const [input, setInput] = useState("");
  const [generation, setGeneration] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setGeneration(<div className="p-4 text-[10px] font-black uppercase text-zinc-500 animate-pulse flex items-center gap-2">
      <Loader2 size={14} className="animate-spin" />
      AI Analiz Ediyor...
    </div>);

    try {
      const ui = await streamCrmInsights(input);
      setGeneration(ui);
    } catch (error) {
      console.error("AI Error:", error);
      setGeneration(<div className="p-4 text-rose-500 text-[10px] font-black uppercase tracking-widest">Analiz sırasında bir hata oluştu.</div>);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-none overflow-hidden flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 flex items-center justify-center text-black">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">AI Analiz Paneli</h2>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Gerçek Zamanlı CRM Veri Analizi</p>
          </div>
        </div>
        <BarChart3 size={18} className="text-zinc-700" />
      </div>

      {/* Generation Area */}
      <div className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto bg-zinc-950/50 p-4 scrollbar-hide">
        {generation ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {generation}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20 group">
             <Sparkles size={40} className="text-zinc-700 mb-4 group-hover:text-teal-500 transition-colors" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Analiz başlatmak için bir soru sorun</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleAsk} className="p-3 bg-black border-t border-zinc-800 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Örn: En çok lead gelen 3 kaynağı göster..." 
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-none px-4 py-2.5 text-[10px] font-bold text-zinc-300 outline-none focus:border-teal-600/50 transition-all placeholder:text-zinc-700 uppercase"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-black px-4 flex items-center justify-center transition-all active:scale-95"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
