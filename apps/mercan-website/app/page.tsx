export const dynamic = "force-dynamic";

import { HeroSection, ToolsGrid, ServicesGrid, NacePromoSection, KatipProcessSection, AboutSection } from "@/components/home/HomeComponents";
import { LatestNews } from "@/components/home/LatestNews";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

import { prisma as db } from "@/lib/db";

export default async function HomePage() {
  const dynamicServices = await (db as any)?.service?.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  }) || [];

  const settings = await (db as any)?.homepageSettings?.findUnique({
    where: { id: 1 }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection settings={settings} />
      
      {/* Quick Tools & FAQ */}
      <ToolsGrid />

      {/* Katip Process Section */}
      <KatipProcessSection settings={settings} />
      
      {/* Services Grid */}
      <ServicesGrid dynamicServices={dynamicServices} />

      {/* NACE Promo Section */}
      <NacePromoSection settings={settings} />
      
      {/* Latest News Feed */}
      <LatestNews />
      
      {/* Trust Banner / Final CTA */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute right-0 top-0 w-1/2 h-full bg-blue-600/10 skew-x-[-20deg] translate-x-24" />
         <div className="container-wide relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-20 text-center lg:text-left">
               <div className="space-y-8">
                  <h2 className="text-white text-5xl md:text-7xl">
                    Güvenli Bir Gelecek <br/> 
                    <span className="text-blue-500">İçin Bize Katılın</span>
                  </h2>
                  <p className="text-slate-400 text-xl font-medium italic max-w-2xl leading-relaxed">
                    Türkiye genelinde 2.500'den fazla firma Mercan OSGB güvencesiyle risklerini minimize ediyor.
                  </p>
               </div>
               <div className="flex flex-col sm:flex-row justify-center gap-4 shrink-0">
                  <Link href="/iletisim#teklif" className="btn-premium bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 text-[10px]">
                     ÜCRETSİZ TEKLİF ALIN <ArrowRight size={18} />
                  </Link>
                  <Link href="tel:+902160000000" className="btn-premium bg-transparent border-white/20 hover:bg-white/5 px-10 py-5 text-[10px] border">
                     <Phone size={18} /> BİZİ ARAYIN
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

