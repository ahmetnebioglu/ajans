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
    <section className="relative pt-40 pb-32 overflow-hidden bg-white">
      <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-10" />
      <div className="container-wide relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="badge-premium">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
               </span>
               Kurumsal İSG Çözümleri
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-[4.5rem] font-black text-slate-900 tracking-tighter uppercase italic leading-[0.95]">
              {titleParts.length > 1 ? (
                <>
                  {titleParts[0]} <span className="text-blue-600">Güvenliği</span> {titleParts[1]}
                </>
              ) : content.title}
            </h1>

            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed italic">
              {content.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
               <Link href="/hizmetlerimiz" className="btn-premium">
                  {content.buttonText} <ArrowRight size={18} />
               </Link>
               <Link href="/kurumsal" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                  BİZ KİMİZ? <span className="w-8 h-px bg-slate-200 group-hover:w-12 group-hover:bg-blue-600 transition-all" />
               </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[500px]">
             <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-full" />
             <div className="relative h-full shadow-2xl border border-slate-100 rounded-[4rem]">
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
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container-wide relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 relative order-2 lg:order-1">
            <div className="absolute -inset-10 bg-blue-600/5 blur-[100px] rounded-full" />
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-600 rounded-3xl -z-10 opacity-20 animate-pulse" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-900 rounded-3xl -z-10 opacity-10" />
              <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border border-slate-100 aspect-[4/5] lg:aspect-square">
                <img 
                  src={settings?.aboutImage || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070"} 
                  className="w-full h-full object-cover"
                  alt={settings?.aboutTitle || "Mercan OSGB Kurumsal"}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-10 order-1 lg:order-2">
            <div className="badge-premium">Kurumsal Tanıtım</div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              {settings?.aboutTitle || "Hakkımızda"}
            </h2>
            
            <div 
              className="prose prose-slate prose-lg dark:prose-invert max-w-none italic font-medium text-slate-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: settings?.aboutContent || "" }}
            />

            <div className="pt-6">
              <Link href="/kurumsal" className="btn-premium">
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
    <section className="section-padding bg-slate-50 border-y border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white skew-x-12 translate-x-1/2" />
      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Left: Quick Access Tool Cards */}
          <div className="space-y-12">
            <div className="space-y-6 text-center lg:text-left">
               <h2 className="italic">Pratik <span className="text-blue-600">İSG Araçları</span></h2>
               <p className="text-slate-500 text-lg font-medium italic">Yasal gerekliliklerinizi saniyeler içinde öğrenin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Link href="/isg-sure-hesaplama" className="card-premium group/card bg-white hover:bg-slate-900 hover:border-slate-900 p-12 space-y-8 transition-all duration-500">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500">
                     <Calculator size={32} />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-2xl italic leading-none group-hover/card:text-white transition-colors">Süre Hesapla</h4>
                     <p className="text-slate-500 text-sm font-medium italic group-hover/card:text-slate-400 transition-colors">İşletmenizin aylık zorunlu İSG hizmet sürelerini hesaplayın.</p>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 pt-4">
                        ARACI AÇ <ArrowRight size={14} className="group-hover/card:translate-x-2 transition-transform" />
                     </div>
                  </div>
               </Link>

               <Link href="/tehlike-siniflari" className="card-premium group/card bg-white hover:bg-slate-900 hover:border-slate-900 p-12 space-y-8 transition-all duration-500">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-500">
                     <ShieldAlert size={32} />
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-2xl italic leading-none group-hover/card:text-white transition-colors">NACE Sorgula</h4>
                     <p className="text-slate-500 text-sm font-medium italic group-hover/card:text-slate-400 transition-colors">İşletmenizin tehlike sınıfını anında öğrenin.</p>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 pt-4">
                        SORGULA <ArrowRight size={14} className="group-hover/card:translate-x-2 transition-transform" />
                     </div>
                  </div>
               </Link>
            </div>
          </div>

          {/* Right: FAQ / Knowledge Base */}
          <div className="space-y-12">
            <div className="space-y-6 text-center lg:text-left">
               <h2 className="italic">Sıkça Sorulan <span className="text-blue-600">Sorular</span></h2>
               <p className="text-slate-500 text-lg font-medium italic">İSG süreçleri hakkında merak edilenleri sizin için yanıtladık.</p>
            </div>

            <Accordion type="single" {...({ collapsible: true } as any)} className="w-full space-y-4">
              {[
                { q: "İSG Hizmeti Almak Zorunlu mu?", a: "Evet, 6331 sayılı kanun kapsamında her işletme hizmet almakla yükümlüdür." },
                { q: "Hangi Tehlike Sınıfındayız?", a: "İşletmenizin tehlike sınıfı NACE kodu ile belirlenir. Aracımızı kullanarak öğrenebilirsiniz." },
                { q: "Risk Analizi Ne Sıklıkla Yapılır?", a: "Tehlike sınıfına göre 2, 4 veya 6 yılda bir yenilenmesi zorunludur." }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-slate-100 rounded-2xl px-8 hover:border-blue-600 transition-colors shadow-sm overflow-hidden leading-none">
                  <AccordionTrigger className="text-[11px] font-black text-slate-900 hover:text-blue-600 uppercase tracking-widest text-left py-6">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 text-sm font-medium italic leading-relaxed pb-6 leading-normal">
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
    <section className="section-padding bg-slate-50/80 relative">
       <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
             <div className="badge-premium">Onay Süreci</div>
             <h2 className="italic">
               İSG-KATİP Onay Süreci <span className="text-blue-600">Nasıl İşler?</span>
             </h2>
             <p className="text-slate-500 font-medium text-lg italic">
               Yasal atamalarınızın aktifleşmesi için gereken 3 basit adım.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10" />
             {steps.map((step: any, i: number) => (
               <div key={i} className="card-premium group relative bg-white border border-slate-100 flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-2xl group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500 -mt-20">
                     {i + 1}
                  </div>
                  <h4 className="text-2xl italic leading-none pt-4">{step.title}</h4>
                  <p className="text-slate-500 text-sm font-medium italic leading-relaxed">
                     {step.desc}
                  </p>
               </div>
             ))}
          </div>

          <div className="mt-20 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 italic font-medium">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                   <Info size={24} />
                </div>
                <p className="text-slate-600 text-sm max-w-xl">
                   Onay süreci tamamlanmayan görevlendirmeler yasal olarak geçersiz sayılmaktadır. 
                   Süreç takibi uzman kadromuz tarafından titizlikle yapılmaktadır.
                </p>
             </div>
             <Link href="/iletisim" className="btn-premium whitespace-nowrap">
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
    <section className="section-padding bg-white relative">
       <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
             <div className="badge-premium">Hizmet Yelpazemiz</div>
             <h2 className="italic">
               Kapsamlı <span className="text-blue-600">Hizmetlerimiz</span>
             </h2>
             <p className="text-slate-500 font-medium text-lg leading-relaxed italic">
               İş sağlığı ve güvenliği alanında ihtiyacınız olan tüm çözümleri tek bir kurumsal çatı altında, en yüksek kalite standartlarında sunuyoruz.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {displayServices.map((service, i) => {
                const IconComponent = (service as any).icon || User;
                return (
                  <Link href={`/hizmetlerimiz/${service.slug}`} key={i} className="card-premium group block">
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 mb-8 shadow-inner">
                        <IconComponent size={32} />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-2xl italic leading-none text-slate-900 group-hover:text-blue-600 transition-colors">{service.name}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium italic">{service.desc}</p>
                        <div className="pt-4">
                           <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 group-hover:gap-4 transition-all">
                              DETAYLI BİLGİ <ArrowRight size={14} />
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
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-blue-300 rounded-md border border-white/10">
                   <ShieldAlert size={14} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Yasal Bilgilendirme</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                   {titleParts.length > 1 ? (
                     <>
                       {titleParts[0]} <br/>
                       <span className="text-blue-500">Doğru Biliyor Musunuz?</span>
                     </>
                   ) : content.title}
                </h2>
                
                <p className="text-slate-400 text-lg font-medium italic leading-relaxed max-w-xl">
                   {content.subtitle}
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                   <div className="space-y-2 border-l-2 border-blue-600 pl-4">
                      <div className="text-2xl font-black text-white tracking-tighter">ANLIK SORGULAMA</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Binlerce NACE kodu arasında saniyeler içinde arama yapın.</div>
                   </div>
                   <div className="space-y-2 border-l-2 border-blue-600 pl-4">
                      <div className="text-2xl font-black text-white tracking-tighter">%100 GÜNCEL</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Resmi gazete ve bakanlık listeleriyle tam uyumlu güncel veri.</div>
                   </div>
                </div>

                <div className="pt-8">
                   <Button size="lg" className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black uppercase text-[11px] tracking-widest px-10 py-7 rounded-md transition-all shadow-2xl shadow-blue-600/20" asChild>
                      <Link href="/tehlike-siniflari">
                         HEMEN NACE KODUNUZU SORGULAYIN <ArrowRight size={18} className="ml-2" />
                      </Link>
                   </Button>
                </div>
             </div>

             <div className="flex-1 relative w-full lg:w-auto">
                <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                   <div className="bg-slate-950 p-10 rounded-xl space-y-6">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                         <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center">
                            <Search size={24} />
                         </div>
                         <div>
                            <div className="text-white font-black text-lg tracking-tight uppercase italic leading-none">Hızlı Sorgu</div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">NACE KODU / İŞ TANIMI</div>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="h-10 bg-white/5 rounded-lg border border-white/10 animate-pulse" />
                         <div className="space-y-2">
                            <div className="h-4 bg-white/10 rounded w-3/4" />
                            <div className="h-4 bg-white/10 rounded w-1/2 opacity-50" />
                         </div>
                         <div className="pt-4 flex gap-2">
                            <div className="h-6 w-20 bg-rose-500/20 rounded-full border border-rose-500/30" />
                            <div className="h-6 w-24 bg-emerald-500/20 rounded-full border border-emerald-500/30" />
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
