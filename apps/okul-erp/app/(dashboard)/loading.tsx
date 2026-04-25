import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 dark:border-zinc-800 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 animate-pulse italic">Okul Sistemi Hazırlanıyor</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 italic">Veriler yükleniyor...</p>
      </div>
    </div>
  );
}
