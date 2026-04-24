import React from "react";
import { prisma } from "@/lib/db";
import NaceSearch from "./NaceSearch";

// ISR: Arka planda veriler her saat güncellensin
export const revalidate = 3600;

export default async function NaceCodesPage() {
  const naceCodes = await (prisma as any).naceCode.findMany({
    orderBy: { code: "asc" }
  });

  return (
    <div className="pt-32 pb-24 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="py-20 mb-8 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Canlı Arama
           </div>
           
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
             Tehlike Sınıfları <span className="text-blue-600">Listesi</span>
           </h1>
           
           <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
             Firmanızın NACE kodunu yazarak veya iş tanımında arama yaparak tehlike sınıfınızı anında öğrenebilirsiniz.
           </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
         <NaceSearch initialData={naceCodes} />

         {/* Call to Action Section */}
         <div className="mt-24 p-12 bg-slate-900 rounded-[3rem] text-center space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                  Tehlike Sınıfınızı Öğrendiniz mi?
               </h2>
               <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">
                  Sektörünüze özel İSG çözümleri ve avantajlı fiyat tekliflerimiz için hemen bizimle iletişime geçin.
               </p>
               <div className="pt-6">
                  <a 
                    href="/teklif-al" 
                    className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-white hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
                  >
                     Hemen Teklif Alın
                  </a>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

