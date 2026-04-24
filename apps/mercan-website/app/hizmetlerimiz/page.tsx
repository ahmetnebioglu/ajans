import { prisma as db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, User, ShieldCheck, Activity, ClipboardCheck, HeartPulse, Zap, Sparkles } from "lucide-react";

export const metadata = {
  title: "Hizmetlerimiz | Mercan OSGB",
  description: "İş sağlığı ve güvenliği alanında sunduğumuz profesyonel çözümler.",
};

export default async function ServicesPage() {
  const dynamicServices = await (db as any)?.service?.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  }) || [];

  const defaultServices = [
    { title: "İşyeri Hekimliği", summary: "Çalışanlarınızın periyodik muayeneleri ve sağlık takipleri uzman hekimlerimizce yürütülür.", slug: "isyeri-hekimligi" },
    { title: "İSG Uzmanlığı", summary: "Yasal mevzuat çerçevesinde iş güvenliği danışmanlığı ve saha denetim hizmetleri.", slug: "isg-uzmanligi" },
    { title: "Risk Analizi", summary: "İş yerindeki olası risklerin saptanması ve bilimsel yöntemlerle derecelendirilmesi.", slug: "risk-analizi" },
    { title: "İSG Eğitimleri", summary: "Temel İSG eğitimlerinden ilkyardım ve yangın eğitimlerine kadar geniş yelpaze.", slug: "isg-egitimleri" },
    { title: "Mobil Sağlık", summary: "İş yerinde hızlı ve teknolojik sağlık tarama (akciğer filmi, işitme testi vb.) hizmetleri.", slug: "mobil-saglik" },
    { title: "Acil Durum Planı", summary: "Olası afet ve acil durumlar için stratejik kaçış, müdahale ve tahliye planlaması.", slug: "acil-durum-plani" }
  ];

  const services = dynamicServices.length > 0 ? dynamicServices : defaultServices;

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

  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="bg-[#0F172A] py-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-[-20%] w-[55%] h-full bg-blue-500/[0.15] skew-x-[-20deg] origin-top border-l border-white/[0.1] shadow-[-20px_0_100px_rgba(37,99,235,0.1)]" />
        </div>
        <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-wide relative z-10 flex flex-col items-center justify-center">
          <div className="max-w-4xl space-y-8 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/20 rounded-full bg-blue-500/5">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                &lt;İSG HİZMETLERİMİZ&gt;
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
              PROFESYONEL <br/>
              <span className="text-blue-500">İSG ÇÖZÜMLERİ</span>
            </h1>
            <p className="text-gray-200 text-lg md:text-xl font-medium italic max-w-2xl leading-relaxed opacity-80">
              İşletmenizin tehlike sınıfına ve ihtiyaçlarına özel olarak yapılandırılmış, 
              yasal mevzuatla %100 uyumlu profesyonel hizmet yelpazemiz.
            </p>
            <div className="px-8 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl mt-4">
              <span className="text-blue-400 font-black uppercase italic tracking-widest text-[10px]">
                Uzman Kadro | Dijital Raporlama | 7/24 Teknik Destek
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: any) => {
              const IconComponent = getIcon(service.slug);
              return (
                <Link
                  href={`/hizmetlerimiz/${service.slug}`}
                  key={service.slug}
                  className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-500 transition-all duration-500 hover:shadow-xl hover:shadow-blue-600/5 flex flex-col h-full overflow-hidden"
                >
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-6">
                    <IconComponent size={24} />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-black italic tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-tight text-left">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 font-medium italic leading-relaxed text-[11px] text-left">
                      {service.summary}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all ml-auto">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Vurgulu (Hero Stilinde) */}
      <section className="py-24 bg-[#0F172A] text-white overflow-hidden relative">
        {/* Hero Stilinde Diyagonal Hat */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute bottom-0 left-[-10%] w-[60%] h-full bg-blue-500/[0.1] skew-x-[20deg] origin-bottom border-r border-white/[0.05] shadow-[20px_0_100px_rgba(37,99,235,0.05)]" />
        </div>
        
        {/* Glow Effect */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container-wide relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/20 rounded-full bg-blue-500/5">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                &lt;KURUMSAL GÜVENLİK&gt;
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight">
              İHTİYACINIZA ÖZEL <br/>
              <span className="text-blue-500">ÇÖZÜM İÇİN</span>
            </h2>

            <p className="text-slate-400 text-lg font-medium italic opacity-80">
              İşletmenizin risklerini beraber analiz edelim ve en uygun İSG hizmet paketini oluşturalım.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Link href="/iletisim#teklif" className="inline-flex items-center gap-4 bg-blue-600 text-white font-black uppercase tracking-widest px-12 py-5 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-2xl shadow-blue-600/40 group">
                TEKLİF ALIN 
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

