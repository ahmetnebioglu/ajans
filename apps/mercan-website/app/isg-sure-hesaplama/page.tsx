import React from "react";
import { IsgDurationCalculator } from "@/components/tools/IsgDurationCalculator";
import { Calculator, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function IsgCalculatorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Premium Dark Header (Original Site Inspired) */}
      <div className="pt-32 pb-16 bg-[#333333] text-white">
        <div className="container-wide text-center space-y-6">
           <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic">
              İSG Profesyonelleri <span className="text-blue-400">Zorunlu</span> Çalışma Süresi
           </h1>
           
           <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">Anasayfa</Link>
              <span>{">"}</span>
              <span className="text-white">İSG Profesyonelleri Zorunlu Çalışma Süresi</span>
           </div>
        </div>
      </div>

      <div className="py-24 bg-slate-50/50">
        <div className="container-wide">
           {/* Section Title for Page */}
           <div className="text-center mb-20 space-y-4">
              <div className="badge-premium mx-auto">
                 <Calculator size={14} className="text-blue-600" />
                 Hesaplama Modülü
              </div>
              <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                 Hizmet Sürenizi <span className="text-blue-600">Hemen</span> Hesaplayın
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium italic text-lg leading-relaxed">
                 İşletmenizin her bir profesyonel için ayırması gereken minimum yasal süreleri aşağıda görebilirsiniz.
              </p>
           </div>

           <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <IsgDurationCalculator />
           </div>

           {/* Legal Footer Info */}
           <div className="mt-24 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl italic relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                 <div className="space-y-4">
                    <h3 className="text-3xl leading-none">Yasal <span className="text-blue-600">Bilgilendirme</span></h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                       Bu hesaplamalar, "İş Güvenliği Uzmanlarının Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik" ve "İşyeri Hekimi ve Diğer Sağlık Personelinin Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik" hükümlerine dayanmaktadır.
                    </p>
                 </div>
                 <div className="flex justify-end">
                    <Link href="/iletisim" className="btn-premium px-12 py-6 bg-blue-600 hover:bg-slate-900 shadow-blue-600/20">
                       Profesyonel Danışmanlık Alın
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
