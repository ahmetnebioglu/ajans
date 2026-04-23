import React from "react";
import ReferenceRequestForm from "../../components/references/ReferenceRequestForm";
import SectorCarousel from "../../components/references/SectorCarousel";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Referanslarımız | Mercan OSGB",
  description: "Müşteri gizliliğine verdiğimiz önem gereği referans listemizi açıkça yayınlamıyoruz. Sektörünüze özel referans listemiz için talep oluşturabilirsiniz.",
};

export default function ReferanslarPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Hero Section - Blue Divided Theme (#0F172A) */}
      <section className="bg-[#0F172A] py-16 relative overflow-hidden text-center">
        
        {/* Alanı İkiye Bölen Diyagonal Çizgi - Bir Tık Daha Sağa */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-[-20%] w-[55%] h-full bg-blue-500/[0.15] skew-x-[-20deg] origin-top border-l border-white/[0.1] shadow-[-20px_0_100px_rgba(37,99,235,0.1)]" />
        </div>

        {/* Mavi Parlama Efekti */}
        <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10 flex flex-col items-center justify-center space-y-8">
           {/* Label Style Sync - Blue Version */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/20 rounded-full bg-blue-500/5">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                &lt;YASAL BİLGİLENDİRME&gt;
              </span>
           </div>

           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9] max-w-5xl">
             REFERANSLARIMIZ <span className="text-blue-500 font-black">GİZLİLİĞİMİZDİR</span>
           </h1>

           <p className="text-slate-400 text-lg md:text-xl font-medium italic max-w-3xl mx-auto leading-relaxed opacity-80">
             Müşterilerimizin gizlilik haklarını korumak adına firma isimlerimizi ve logolarımızı açıkça yayınlamıyoruz. 
             Ancak Türkiye'nin her sektöründe 2.500'den fazla aktif firmaya hizmet vermekteyiz.
           </p>

           {/* REFINED GLASS BADGE - Position Protected */}
           <div className="mt-4 px-10 py-5 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <span className="text-blue-400 font-black uppercase italic tracking-[0.25em] text-[10px] block">
                2500+ AKTİF MÜŞTERİ | TÜM SEKTÖRLERDE GÜVENLİ HİZMET
              </span>
           </div>
        </div>
      </section>

      {/* Sectors Carousel Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container-wide mb-16 text-center">
           <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
             HİZMET VERDİĞİMİZ <span className="text-blue-600">SEKTÖRLER</span>
           </h2>
        </div>
        
        <div className="container-wide">
           <SectorCarousel />
        </div>
      </section>

      {/* Reference Request Form Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container-wide max-w-5xl text-center space-y-12">
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                BU SEKTÖRLERDEKİ REFERANSLARIMIZI <span className="text-blue-600">TALEP EDİN</span>
              </h2>
              <p className="text-slate-500 font-medium italic">
                Sektörünüzde özel referans listemiz ve başarı hikayelerimiz için aşağıdaki formu doldurmanız yeterlidir.
              </p>
           </div>
           <ReferenceRequestForm />
        </div>
      </section>
    </div>
  );
}
