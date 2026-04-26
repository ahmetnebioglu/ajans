"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, BarChart3 } from "lucide-react";
import { streamCrmInsights } from "./ai-actions";
import { readStreamableValue } from "@ai-sdk/rsc";

export default function AiDashboard() {
  const [input, setInput] = useState("");
  const [generation, setGeneration] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="mb-4 w-[400px] bg-zinc-900 border border-zinc-800 rounded-[4px] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white rounded-[4px]">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">AI Analiz Paneli</h2>
                <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">MERCAN GEN-AI CRM ENGINE</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
            >
              <BarChart3 size={18} />
            </button>
          </div>

          {/* Generation Area */}
          <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto bg-zinc-950/80 p-4 scrollbar-hide">
            {generation ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {generation}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20 group">
                 <Sparkles size={40} className="text-zinc-700 mb-4 group-hover:text-red-500 transition-colors" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Analiz başlatmak için bir soru sorun</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleAsk} className="p-3 bg-black border-t border-zinc-800 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Örn: En çok lead gelen 3 kaynağı göster..." 
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[4px] px-4 py-3 text-[10px] font-bold text-zinc-300 outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-700 uppercase italic"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-5 flex items-center justify-center transition-all active:scale-95 rounded-[4px]"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 group relative overflow-hidden ${
          isOpen ? "bg-zinc-800 text-red-500 rotate-90" : "bg-red-600 text-white hover:scale-110"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <Sparkles size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </button>
    </div>
  );
}
