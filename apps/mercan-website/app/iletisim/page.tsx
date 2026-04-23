import React from "react";
import { Phone, MapPin, Clock, CreditCard, Sparkles } from "lucide-react";
import { prisma as db } from "@ajans/db";
import ContactForm from "../../components/contact/ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await (db as any)?.homepageSettings?.findUnique({
    where: { id: 1 }
  });

  const mapUrl = settings?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.2863673752693!2d29.1415177!3d40.9231885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac3762269a911%3A0x6b40e79782559b1!2sCevizli%2C%20Ba%C4%9Fdat%20Cd.%20No%3A538%2C%2034846%20Maltepe%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1713824000000!5m2!1str!2str";

  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Hero Header */}
      <section className="bg-[#0F172A] py-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-[-15%] w-[60%] h-full bg-blue-500/[0.15] skew-x-[-20deg] origin-top border-l border-white/[0.1] shadow-[-20px_0_100px_rgba(37,99,235,0.1)]" />
        </div>
        <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10 flex flex-col items-center justify-center space-y-8">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/20 rounded-full bg-blue-500/5">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                &lt;BİZE ULAŞIN&gt;
              </span>
           </div>

           <h1 className="text-5xl md:text-[7rem] font-black text-white tracking-tight uppercase italic leading-[1] max-w-5xl">
             İLETİŞİM <span className="text-blue-500 font-black">BİLGİLERİMİZ</span>
           </h1>

           <p className="text-slate-400 text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed opacity-80">
             İşletmeniz için en uygun İSG çözümlerini beraber planlayalım. Formu doldurarak bize ulaşabilirsiniz.
           </p>
        </div>
      </section>

      {/* Main Contact Section: Info + Form */}
      <section className="py-20 bg-white relative">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-start gap-12 -mt-32 relative z-20">
            {/* Left: Horizontal Info Cards - Fixed Heights */}
            <div className="lg:w-1/3 space-y-4 w-full">
              {/* Address */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex items-start gap-5 group hover:border-blue-500 transition-all duration-500">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                  <MapPin size={24} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-tight">Merkez Ofis</h3>
                   <p className="text-slate-500 font-medium italic text-[11px] leading-relaxed">
                     Cevizli Mahallesi Bağdat Caddesi Ofistanbul No: 538/7 Maltepe / İSTANBUL
                   </p>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex items-start gap-5 group hover:border-blue-500 transition-all duration-500">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                  <Phone size={24} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-tight">Destek Hatları</h3>
                   <div className="space-y-0.5">
                     <p className="text-slate-500 font-medium italic text-[11px]">0 (216) 352 10 50</p>
                     <p className="text-slate-500 font-medium italic text-[11px]">0 (532) 578 49 45</p>
                   </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex items-start gap-5 group hover:border-blue-500 transition-all duration-500">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                  <Clock size={24} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-tight">Mesai Saatleri</h3>
                   <p className="text-slate-500 font-medium italic text-[11px] leading-relaxed">
                     Hafta İçi: 09:00 - 18:00 <br/>
                     Cumartesi - Pazar: Kapalı
                   </p>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:w-2/3 w-full">
              <ContactForm />
            </div>
          </div>

          {/* IBAN Area - Corrected Company Title Position */}
          <div className="mt-20 p-10 bg-[#0F172A] rounded-[2rem] border border-white/5 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="absolute left-0 bottom-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 pointer-events-none" />
            
            <div className="relative z-10 space-y-6 max-w-xl text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-blue-600/20">M</div>
                <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">Kurumsal Bilgiler</h4>
              </div>
              <div className="space-y-1">
                <p className="text-blue-400 font-black uppercase italic tracking-tighter text-sm">MERCAN ORTAK SAĞLIK GÜVENLİK BİRİMİ TİC. LTD. ŞTİ.</p>
                <p className="text-slate-500 text-[10px] font-medium italic leading-relaxed">
                  Resmi yazışmalarınız ve fatura işlemleriniz için yukarıdaki kurumsal unvanı kullanmanızı rica ederiz.
                </p>
              </div>
            </div>
            
            <div className="relative z-10 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex items-center gap-6 w-full lg:w-auto group-hover:border-blue-500/30 transition-all duration-500">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-600/20">
                <CreditCard size={28} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 italic">Kurumsal IBAN Hesabı</p>
                <p className="text-base font-black tracking-widest text-white">TR80 0006 4000 0011 0372 0424 57</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] bg-slate-900 relative grayscale hover:grayscale-0 transition-all duration-1000 border-t border-white/5">
         <iframe 
            src={mapUrl}
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full opacity-80"
         ></iframe>
      </section>
    </div>
  );
}
