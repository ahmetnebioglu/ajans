import React from "react";
import { prisma as db } from "@/lib/db";
import { Shield, Target, Eye, Users, CheckCircle2 } from "lucide-react";
import CountUp from "@/components/ui/CountUp";

export const dynamic = "force-dynamic";

export default async function CorporatePage() {
  const settings = await (db as any)?.homepageSettings?.findUnique({
    where: { id: 1 }
  });

  const aboutTitle = settings?.aboutTitle || "Biz Kimiz?";
  const aboutContent = settings?.aboutContent || "";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Header */}
      <section className="pt-40 pb-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-600/10 skew-x-[-20deg] translate-x-24" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="container-wide relative z-10 text-center space-y-6">
          <div className="badge-premium border-white/20 text-emerald-400">KURUMSAL</div>
          <h1 className="flex flex-col md:flex-row items-center justify-center gap-x-5 text-6xl md:text-[7rem] font-black italic uppercase leading-[0.85] tracking-tighter">
            <span className="text-white">Mercan</span>
            <span className="text-emerald-500">OSGB</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium pt-2">
            İş sağlığı ve güvenliğinde 20 yıllık tecrübeyle geleceği inşa ediyoruz.
          </p>

          {/* İstatistikler Hero İçinde */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12">
            {[
              { value: 20, suffix: "+", label: "Yıllık Tecrübe" },
              { value: 2500, suffix: "+", label: "Aktif Firma" },
              { value: 100, prefix: "%", label: "Yasal Uyumluluk" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black italic text-emerald-400">
                  <CountUp end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ana İçerik Bölümü */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sol: Değerler */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-emerald-500 pl-4">Kurumsal Değerlerimiz</h3>
              {[
                { icon: Shield, label: "Güvenlik Önceliği", desc: "Her kararımızda güvenliği ilk sıraya alıyoruz.", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Target, label: "Hassas Yaklaşım", desc: "Her firmaya özgü çözümler üretiyoruz.", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Eye, label: "Tam Şeffaflık", desc: "Tüm süreçlerimizi açık ve denetlenebilir tutuyoruz.", color: "text-amber-600", bg: "bg-amber-50" },
                { icon: Users, label: "Uzman Kadro", desc: "Alanında deneyimli profesyonellerden oluşan ekip.", color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all group cursor-default">
                  <div className={`w-11 h-11 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-tight text-slate-900">{item.label}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}

              {/* ISO Sertifika Rozeti */}
              <div className="mt-8 p-5 bg-slate-900 rounded-2xl flex items-center gap-4">
                <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sertifikalı Kuruluş</div>
                  <div className="text-white font-black italic text-sm">ISO 9001:2015</div>
                </div>
              </div>
            </div>

            {/* Sağ: Dinamik İçerik */}
            <div className="lg:col-span-8">
              <div className="space-y-6 mb-10">
                <div className="badge-premium border-emerald-100 text-emerald-600">{aboutTitle}</div>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">
                  İşletmenizi Güvenle <br/><span className="text-emerald-600">Büyütüyoruz</span>
                </h2>
              </div>

              {aboutContent ? (
                <div
                  className="prose prose-lg prose-slate max-w-none
                    prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-slate-900
                    prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed prose-p:text-base
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-li:text-slate-500 prose-li:font-medium
                    prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: aboutContent }}
                />
              ) : (
                <div className="space-y-5 text-slate-500 font-medium leading-relaxed">
                  <p>
                    Mercan OSGB olarak, 2004 yılından bu yana Türkiye'nin önde gelen iş sağlığı ve güvenliği hizmet sağlayıcılarından biri olarak faaliyet gösteriyoruz. 
                    İstanbul merkezli yapımızla, ülke genelinde binlerce firmaya kapsamlı İSG çözümleri sunuyoruz.
                  </p>
                  <p>
                    Uzman İSG profesyonelleri, işyeri hekimleri ve mühendislerden oluşan deneyimli ekibimizle; 
                    iş kazalarını sıfıra indirmeyi, çalışanların sağlığını korumayı ve firmaların yasal yükümlülüklerini 
                    eksiksiz yerine getirmesini sağlamayı hedefliyoruz.
                  </p>
                  <p>
                    ISO 9001:2015 kalite yönetim sistemi sertifikamız ve sürekli güncellenen uzmanlığımızla, 
                    müşterilerimize yalnızca bugünün değil, geleceğin de gereksinimlerini karşılayan çözümler sunuyoruz.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Alt CTA Banner */}
      <section className="py-24 bg-slate-50">
        <div className="container-wide">
          <div className="bg-slate-900 rounded-[3rem] p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-600/10 skew-x-[-20deg] translate-x-16" />
            <div className="space-y-4 max-w-xl relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">İSG Dijital Dönüşüm</div>
              <h3 className="text-4xl font-black italic uppercase text-white leading-tight">
                Güvenli Bir Gelecek <br/><span className="text-emerald-400">İçin Bize Katılın</span>
              </h3>
              <p className="text-slate-400 font-medium">
                Mercan ERP ile tüm İSG süreçlerinizi tek noktadan, şeffaf ve hatasız yönetin.
              </p>
            </div>
            <div className="flex flex-col gap-4 relative z-10">
              <a href="/iletisim#teklif" className="btn-premium bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest">
                ÜCRETSİZ TEKLİF ALIN
              </a>
              <a href="tel:+902163521050" className="btn-premium border-white/20 text-white hover:bg-white/10 px-10 py-5 text-[10px] font-black uppercase tracking-widest border">
                0 (216) 352 10 50
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

