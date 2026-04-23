import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User, Activity, ShieldCheck, ClipboardCheck, Zap, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ServicesGrid() {
  const services = [
    { name: "İşyeri Hekimliği", icon: User, desc: "Çalışanlarınızın periyodik muayeneleri ve sağlık takipleri uzman hekimlerimizce yürütülür." },
    { name: "İSG Uzmanlığı", icon: ShieldCheck, desc: "Yasal mevzuat çerçevesinde iş güvenliği danışmanlığı ve saha denetim hizmetleri." },
    { name: "Risk Analizi", icon: Activity, desc: "İş yerindeki olası risklerin saptanması ve bilimsel yöntemlerle derecelendirilmesi." },
    { name: "İSG Eğitimleri", icon: ClipboardCheck, desc: "Temel İSG eğitimlerinden ilkyardım ve yangın eğitimlerine kadar geniş yelpaze." },
    { name: "Mobil Sağlık", icon: HeartPulse, desc: "İş yerinde hızlı ve teknolojik sağlık tarama (akciğer filmi, işitme testi vb.) hizmetleri." },
    { name: "Acil Durum Planı", icon: Zap, desc: "Olası afet ve acil durumlar için stratejik kaçış, müdahale ve tahliye planlaması." }
  ];

  return (
    <section className="py-24 bg-white">
       <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
             <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">
               Kapsamlı <span className="text-corporate-blue">Hizmetlerimiz</span>
             </h2>
             <p className="text-slate-500 font-medium leading-relaxed">
               İş sağlığı ve güvenliği alanında ihtiyacınız olan tüm çözümleri tek bir kurumsal çatı altında, en yüksek kalite standartlarında sunuyoruz.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {services.map((service, i) => (
               <Card key={i} className="group border border-slate-100 hover:border-corporate-blue/20 hover:shadow-xl transition-all duration-300 rounded-md">
                  <CardHeader className="p-10 pb-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-md flex items-center justify-center text-corporate-blue group-hover:bg-corporate-blue group-hover:text-white transition-all">
                       <service.icon size={28} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-4">
                     <CardTitle className="text-xl font-bold uppercase tracking-tight text-slate-900 leading-none">{service.name}</CardTitle>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium italic">{service.desc}</p>
                     <Link href="/hizmetlerimiz" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-corporate-blue opacity-0 group-hover:opacity-100 transition-all">
                        DETAYLI BİLGİ <ArrowRight size={14} />
                     </Link>
                  </CardContent>
               </Card>
             ))}
          </div>
       </div>
    </section>
  );
}

export function LatestNews() {
  const news = [
    { title: "2026 İSG Mevzuat Değişiklikleri Hakkında Özet", date: "22 Nisan 2026", category: "Mevzuat" },
    { title: "Yeni Nesil Mobil Sağlık Taramalarımız Başladı", date: "18 Nisan 2026", category: "Duyuru" },
    { title: "Ataşehir Ofisimizde İSG Uzmanları Zirvesi", date: "15 Nisan 2026", category: "Etkinlik" }
  ];

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100">
       <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
             <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic leading-none">
                  Güncel <span className="text-corporate-blue">Haberler</span>
                </h2>
                <p className="text-slate-500 font-medium italic">Sektörel gelişmeler, mevzuat haberleri ve Mercan OSGB'den duyurular.</p>
             </div>
             <Link href="/haberler" className="px-8 py-4 border-2 border-slate-900 text-slate-900 rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                TÜM HABERLER
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {news.map((item, i) => (
               <Link key={i} href="#" className="group space-y-6">
                  <div className="aspect-[16/10] bg-slate-200 rounded-md overflow-hidden relative shadow-sm border border-slate-100">
                     <img 
                       src={`https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000&index=${i}`} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       alt={item.title}
                     />
                     <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded text-[9px] font-bold uppercase tracking-widest text-corporate-blue shadow-lg">
                        {item.category}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={14} /> {item.date}
                     </div>
                     <h3 className="text-lg font-bold uppercase tracking-tight text-slate-900 group-hover:text-corporate-blue transition-colors leading-tight">
                        {item.title}
                     </h3>
                  </div>
               </Link>
             ))}
          </div>
       </div>
    </section>
  );
}
