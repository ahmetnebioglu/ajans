"use client";

import React from "react";
import { CheckCircle2, Info, ArrowRight } from "lucide-react";

export function KatipOnaySureci() {
  const steps = [
    { title: "Sözleşme Girişi", desc: "İSG-KATİP sistemi üzerinden kurumumuz tarafından sözleşme girişi yapılır." },
    { title: "İşveren Onayı", desc: "İşveren veya vekili e-Devlet üzerinden İSG-KATİP'e girerek sözleşmeyi onaylar." },
    { title: "Hizmet Başlangıcı", desc: "Onay işlemi tamamlandığı an yasal hizmet süreci ve atamalar aktifleşir." }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="relative p-6 bg-slate-50 border border-slate-100 rounded-md space-y-4 group hover:bg-white hover:shadow-lg transition-all">
            <div className="w-8 h-8 bg-corporate-green text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg shadow-green-600/20">
              {i + 1}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">{step.desc}</p>
            </div>
            {i < 2 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-200" size={20} />}
          </div>
        ))}
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-4">
        <Info className="text-corporate-blue shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-xs text-slate-700 font-bold uppercase tracking-tight">Önemli Not</p>
          <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
            Onay süreci tamamlanmayan görevlendirmeler yasal olarak geçersiz sayılmaktadır. Süreç takibi uzman kadromuz tarafından titizlikle yapılmaktadır.
          </p>
        </div>
      </div>
    </div>
  );
}
