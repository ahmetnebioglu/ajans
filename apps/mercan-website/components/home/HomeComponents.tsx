"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle, ShieldAlert, Info, User, Activity, ShieldCheck, ClipboardCheck, Zap, HeartPulse, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IsgDurationCalculator } from "../tools/IsgDurationCalculator";
import { NaceCodeSearch } from "../tools/NaceCodeSearch";
import { KatipOnaySureci } from "../tools/KatipOnaySureci";

import HeroSlider from "./HeroSlider";

export function HeroSection({ settings }: { settings?: any }) {
  // Veriyi güvenli bir şekilde diziye dönüştürelim
  let heroImages: string[] = [];
  try {
    if (Array.isArray(settings?.heroImages)) {
      heroImages = settings.heroImages;
    } else if (typeof settings?.heroImages === 'string') {
      heroImages = JSON.parse(settings.heroImages);
    }
  } catch (e) {
    console.error("Hero images parse error:", e);
  }

  // Debug log - Terminalde görebilirsiniz
  console.log(">>> WEBSITE HERO DATA:", {
    hasSettings: !!settings,
    rawImages: settings?.heroImages,
    parsedImagesCount: heroImages?.length
  });

  const content = {
    title: settings?.heroTitle || "İşletmenizin Güvenliği İçin Uzman Dokunuş.",
    subtitle: settings?.heroSubtitle || "20 yıllık sektörel tecrübemiz ve uzman kadromuzla, iş kazalarını minimize ediyor, çalışan sağlığını koruyan profesyonel sistemler kuruyoruz.",
    buttonText: settings?.heroButtonText || "Hizmetlerimizi Keşfedin",
    images: heroImages && heroImages.length > 0 ? heroImages : [
      "https://images.unsplash.com/photo-1573164060897-425941c30312?auto=format&fit=crop&q=80&w=2069",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=2070"
    ]
  };

  // Split title to allow for the blue span if it matches original pattern
  const titleParts = content.title.split("Güvenliği");

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-white">
      <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-10" />
      <div className="container-wide relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="badge-premium rounded-[2px] px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-[2px] bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-[2px] h-2 w-2 bg-blue-600"></span>
               </span>
               Kurumsal İSG Çözümleri
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-[4rem] font-black text-slate-900 tracking-tighter uppercase italic leading-[0.95]">
              {titleParts.length > 1 ? (
                <>
                  {titleParts[0]} <span className="text-blue-600">Güvenliği</span> {titleParts[1]}
                </>
              ) : content.title}
            </h1>

            <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed italic">
              {content.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
               <Link href="/hizmetlerimiz" className="btn-premium rounded-[2px] px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                  {content.buttonText} <ArrowRight size={18} />
               </Link>
               <Link href="/kurumsal" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                  BİZ KİMİZ? <span className="w-6 h-px bg-slate-200 group-hover:w-10 group-hover:bg-blue-600 transition-all" />
               </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[450px]">
             <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-[2px]" />
             <div className="relative h-full shadow-2xl border border-slate-100 rounded-[2px] overflow-hidden">
                <HeroSlider images={content.images} />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection({ settings }: { settings?: any }) {
  if (!settings?.aboutTitle && !settings?.aboutContent) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container-wide relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 relative order-2 lg:order-1">
            <div className="absolute -inset-10 bg-blue-600/5 blur-[80px] rounded-[2px]" />
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600 rounded-[2px] -z-10 opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-900 rounded-[2px] -z-10 opacity-10" />
              <div className="relative rounded-[2px] overflow-hidden shadow-2xl border border-slate-100 aspect-[4/5] lg:aspect-square">
                <img 
                  src={settings?.aboutImage || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070"} 
                  className="w-full h-full object-cover"
                  alt={settings?.aboutTitle || "Mercan OSGB Kurumsal"}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8 order-1 lg:order-2">
            <div className="badge-premium rounded-[2px] px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">Kurumsal Tanıtım</div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              {settings?.aboutTitle || "Hakkımızda"}
            </h2>
            
            <div 
              className="prose prose-slate prose-md dark:prose-invert max-w-none italic font-medium text-slate-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: settings?.aboutContent || "" }}
            />

            <div className="pt-4">
              <Link href="/kurumsal" className="btn-premium rounded-[2px] px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                DAHA FAZLA BİLGİ <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ToolsGrid() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white skew-x-12 translate-x-1/2" />
      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Quick Access Tool Cards */}
          <div className="space-y-8">
            <div className="space-y-4 text-center lg:text-left">
               <h2 className="text-3xl italic">Pratik <span className="text-blue-600">İSG Araçları</span></h2>
               <p className="text-slate-500 text-base font-medium italic">Yasal gerekliliklerinizi saniyeler içinde öğrenin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Link href="/isg-sure-hesaplama" className="group/card bg-white hover:bg-slate-900 border border-slate-100 hover:border-slate-900 p-8 space-y-6 transition-all duration-500 rounded-[2px] shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[2px] flex items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500">
                     <Calculator size={24} />
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-xl italic leading-none group-hover/card:text-white transition-colors">Süre Hesapla</h4>
                     <p className="text-slate-500 text-xs font-medium italic group-hover/card:text-slate-400 transition-colors leading-relaxed">İşletmenizin aylık zorunlu İSG hizmet sürelerini hesaplayın.</p>
                     <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 pt-2">
                        ARACI AÇ <ArrowRight size={12} className="group-hover/card:translate-x-2 transition-transform" />
                     </div>
                  </div>
               </Link>

               <Link href="/tehlike-siniflari" className="group/card bg-white hover:bg-slate-900 border border-slate-100 hover:border-slate-900 p-8 space-y-6 transition-all duration-500 rounded-[2px] shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[2px] flex items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500">
                     <ShieldAlert size={24} />
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-xl italic leading-none group-hover/card:text-white transition-colors">NACE Sorgula</h4>
                     <p className="text-slate-500 text-xs font-medium italic group-hover/card:text-slate-400 transition-colors leading-relaxed">İşletmenizin tehlike sınıfını anında öğrenin.</p>
                     <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 pt-2">
                        SORGULA <ArrowRight size={12} className="group-hover/card:translate-x-2 transition-transform" />
                     </div>
                  </div>
               </Link>
            </div>
          </div>

          {/* Right: FAQ / Knowledge Base */}
          <div className="space-y-8">
            <div className="space-y-4 text-center lg:text-left">
               <h2 className="text-3xl italic">Sıkça Sorulan <span className="text-blue-600">Sorular</span></h2>
               <p className="text-slate-500 text-base font-medium italic">İSG süreçleri hakkında merak edilenleri sizin için yanıtladık.</p>
            </div>

            <Accordion type="single" {...({ collapsible: true } as any)} className="w-full space-y-3">
              {[
                { q: "İSG Hizmeti Almak Zorunlu mu?", a: "Evet, 6331 sayılı kanun kapsamında her işletme hizmet almakla yükümlüdür." },
                { q: "Hangi Tehlike Sınıfındayız?", a: "İşletmenizin tehlike sınıfı NACE kodu ile belirlenir. Aracımızı kullanarak öğrenebilirsiniz." },
                { q: "Risk Analizi Ne Sıklıkla Yapılır?", a: "Tehlike sınıfına göre 2, 4 veya 6 yılda bir yenilenmesi zorunludur." }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-slate-100 rounded-[2px] px-6 hover:border-blue-600 transition-colors shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-[10px] font-black text-slate-900 hover:text-blue-600 uppercase tracking-widest text-left py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 text-xs font-medium italic leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

export function KatipProcessSection({ settings }: { settings?: any }) {
  const steps = settings?.katipProcess || [
    { title: "Sözleşme Girişi", desc: "İSG-KATİP sistemi üzerinden kurumumuz tarafından sözleşme girişi yapılır." },
    { title: "İşveren Onayı", desc: "İşveren veya vekili e-Devlet üzerinden İSG-KATİP'e girerek sözleşmeyi onaylar." },
    { title: "Hizmet Başlangıcı", desc: "Onay işlemi tamamlandığı an yasal hizmet süreci ve atamalar aktifleşir." }
  ];

  return (
    <section className="py-24 bg-slate-50/80 relative">
       <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
             <div className="badge-premium rounded-[2px] px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">Onay Süreci</div>
             <h2 className="text-3xl italic">
               İSG-KATİP Onay Süreci <span className="text-blue-600">Nasıl İşler?</span>
             </h2>
             <p className="text-slate-500 font-medium text-base italic">
               Yasal atamalarınızın aktifleşmesi için gereken 3 basit adım.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10" />
             {steps.map((step: any, i: number) => (
                <div key={i} className="group relative bg-white border border-slate-100 rounded-[2px] p-8 flex flex-col items-center text-center space-y-6 shadow-sm hover:border-blue-600 transition-all">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-[2px] flex items-center justify-center text-xl font-black italic shadow-xl group-hover:bg-blue-600 group-hover:scale-105 transition-all duration-500 -mt-14">
                     {i + 1}
                  </div>
                  <h4 className="text-xl italic leading-none pt-2">{step.title}</h4>
                  <p className="text-slate-500 text-xs font-medium italic leading-relaxed">
                     {step.desc}
                  </p>
               </div>
             ))}
          </div>

          <div className="mt-16 p-8 bg-slate-50 rounded-[2px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 italic font-medium">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-[2px] flex items-center justify-center shrink-0">
                   <Info size={20} />
                </div>
                <p className="text-slate-600 text-xs max-w-xl">
                   Onay süreci tamamlanmayan görevlendirmeler yasal olarak geçersiz sayılmaktadır. 
                   Süreç takibi uzman kadromuz tarafından titizlikle yapılmaktadır.
                </p>
             </div>
             <Link href="/iletisim" className="btn-premium rounded-[2px] px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 whitespace-nowrap">
                DETAYLI BİLGİ ALIN <ArrowRight size={16} />
             </Link>
          </div>
       </div>
    </section>
  );
}

export function ServicesGrid({ dynamicServices = [] }: { dynamicServices?: any[] }) {
  const defaultServices = [
    { name: "İşyeri Hekimliği", icon: User, desc: "Çalışanlarınızın periyodik muayeneleri ve sağlık takipleri uzman hekimlerimizce yürütülür.", slug: "isyeri-hekimligi" },
    { name: "İSG Uzmanlığı", icon: ShieldCheck, desc: "Yasal mevzuat çerçevesinde iş güvenliği danışmanlığı ve saha denetim hizmetleri.", slug: "isg-uzmanligi" },
    { name: "Risk Analizi", icon: Activity, desc: "İş yerindeki olası risklerin saptanması ve bilimsel yöntemlerle derecelendirilmesi.", slug: "risk-analizi" },
    { name: "İSG Eğitimleri", icon: ClipboardCheck, desc: "Temel İSG eğitimlerinden ilkyardım ve yangın eğitimlerine kadar geniş yelpaze.", slug: "isg-egitimleri" },
    { name: "Mobil Sağlık", icon: HeartPulse, desc: "İş yerinde hızlı ve teknolojik sağlık tarama (akciğer filmi, işitme testi vb.) hizmetleri.", slug: "mobil-saglik" },
    { name: "Acil Durum Planı", icon: Zap, desc: "Olası afet ve acil durumlar için stratejik kaçış, müdahale ve tahliye planlaması.", slug: "acil-durum-plani" }
  ];

  // Icon mapping based on slug
  const getIcon = (slug: string) => {
    switch (slug) {
      case "isyeri-hekimligi": return User;
      case "isg-uzmanligi": return ShieldCheck;
      case "risk-analizi": return Activity;
      case "isg-egitimleri": return ClipboardCheck;
      case "mobil-saglik": return HeartPulse;
      case "acil-durum-plani": return Zap;
      default: return ShieldCheck;
    }
  };

  // Use dynamic services from DB if available, otherwise fallback to defaults
  const displayServices = dynamicServices.length > 0 
    ? dynamicServices.map(ds => ({
        name: ds.title,
        desc: ds.summary || "",
        slug: ds.slug,
        icon: getIcon(ds.slug)
      }))
    : defaultServices;

  return (
    <section className="py-24 bg-white relative">
       <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
             <div className="badge-premium rounded-[2px] px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">Hizmet Yelpazemiz</div>
             <h2 className="text-3xl italic">
               Kapsamlı <span className="text-blue-600">Hizmetlerimiz</span>
             </h2>
             <p className="text-slate-500 font-medium text-base leading-relaxed italic">
                İş sağlığı ve güvenliği alanında ihtiyacınız olan tüm çözümleri tek bir kurumsal çatı altında sunuyoruz.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {displayServices.map((service, i) => {
                const IconComponent = (service as any).icon || User;
                return (
                  <Link href={`/hizmetlerimiz/${service.slug}`} key={i} className="group block p-8 bg-white border border-slate-100 rounded-[2px] hover:border-blue-600 transition-all shadow-sm">
                     <div className="w-12 h-12 bg-slate-50 rounded-[2px] flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-3 transition-all duration-500 mb-6 shadow-inner">
                        <IconComponent size={24} />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-xl italic leading-none text-slate-900 group-hover:text-blue-600 transition-colors">{service.name}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium italic">{service.desc}</p>
                        <div className="pt-2">
                           <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 group-hover:gap-4 transition-all">
                              DETAYLI BİLGİ <ArrowRight size={12} />
                           </span>
                        </div>
                     </div>
                  </Link>
                );
             })}
          </div>
       </div>
    </section>
  );
}

export function NacePromoSection({ settings }: { settings?: any }) {
  const content = {
    title: settings?.naceBannerTitle || "Tehlike Sınıfınızı Doğru Biliyor Musunuz?",
    subtitle: settings?.naceBannerSubtitle || "İşletmenizin NACE kodu, yasal İSG sürelerinizden uzman atamanıza kadar her şeyi belirler. Yanlış bildirimler ciddi cezai yaptırımlara yol açabilir."
  };

  // Handle title highlighting
  const titleParts = content.title.split("Doğru Biliyor Musunuz?");

  return (
    <section className="py-24 bg-slate-900 overflow-hidden relative group">
       <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 skew-x-[-20deg] translate-x-24" />
       <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
             <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-blue-300 rounded-[2px] border border-white/10">
                   <ShieldAlert size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Yasal Bilgilendirme</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                   {titleParts.length > 1 ? (
                     <>
                       {titleParts[0]} <br/>
                       <span className="text-blue-500">Doğru Biliyor Musunuz?</span>
                     </>
                   ) : content.title}
                </h2>
                
                <p className="text-slate-400 text-base font-medium italic leading-relaxed max-w-xl">
                   {content.subtitle}
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                   <div className="space-y-2 border-l-2 border-blue-600 pl-4">
                      <div className="text-xl font-black text-white tracking-tighter uppercase">ANLIK SORGULAMA</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Binlerce NACE kodu arasında saniyeler içinde arama yapın.</div>
                   </div>
                   <div className="space-y-2 border-l-2 border-blue-600 pl-4">
                      <div className="text-xl font-black text-white tracking-tighter uppercase">%100 GÜNCEL</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Resmi gazete ve bakanlık listeleriyle tam uyumlu güncel veri.</div>
                   </div>
                </div>

                <div className="pt-6">
                   <Button size="lg" className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black uppercase text-[10px] tracking-widest px-8 py-5 rounded-[2px] transition-all shadow-2xl shadow-blue-600/20" asChild>
                      <Link href="/tehlike-siniflari">
                         HEMEN NACE KODUNUZU SORGULAYIN <ArrowRight size={18} className="ml-2" />
                      </Link>
                   </Button>
                </div>
             </div>

             <div className="flex-1 relative w-full lg:w-auto">
                <div className="absolute -inset-10 bg-blue-600/20 blur-[80px] rounded-[2px] group-hover:scale-105 transition-transform duration-700" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-[2px] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                   <div className="bg-slate-950 p-8 rounded-[2px] space-y-6">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                         <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-[2px] flex items-center justify-center">
                            <Search size={20} />
                         </div>
                         <div>
                            <div className="text-white font-black text-base tracking-tight uppercase italic leading-none">Hızlı Sorgu</div>
                            <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">NACE KODU / İŞ TANIMI</div>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="h-8 bg-white/5 rounded-[2px] border border-white/10 animate-pulse" />
                         <div className="space-y-2">
                            <div className="h-3 bg-white/10 rounded-[2px] w-3/4" />
                            <div className="h-3 bg-white/10 rounded-[2px] w-1/2 opacity-50" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}
