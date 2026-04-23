"use client";

import React from "react";
import { IsgDurationCalculator } from "./IsgDurationCalculator";
import { NaceCodeSearch } from "./NaceCodeSearch";
import { Tabs } from "../ui/CustomUi";

export function ToolsHub() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 space-y-20">
         <div className="text-center space-y-6">
            <h2 className="text-6xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">
              İSG <span className="text-blue-600">Araçlar & Sorgulama</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium italic">
              İşletmenizin İSG süreçlerini planlamak ve yasal gereklilikleri öğrenmek için geliştirdiğimiz interaktif araçlarımızı kullanın.
            </p>
         </div>

         <Tabs tabs={[
           { 
             label: "Süre Hesaplayıcı", 
             content: <IsgDurationCalculator /> 
           },
           { 
             label: "NACE Kodu Sorgulama", 
             content: <NaceCodeSearch /> 
           }
         ]} />
      </div>
    </section>
  );
}
