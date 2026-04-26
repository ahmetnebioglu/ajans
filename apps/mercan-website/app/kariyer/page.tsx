import React from "react";
import CareerForm from "./career-form";
import { getActiveJobPostings } from "./actions";
import { Sparkles, Star, Users, Zap, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KariyerPage() {
  const jobs = await getActiveJobPostings();

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#334155_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,_#1e293b_0%,_transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={12} className="text-amber-500" />
            Kariyer Fırsatları
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Geleceği Birlikte <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">İnşa Edelim</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 font-medium text-lg">
            Mercan Grup ailesine katılarak vizyoner projelerde yer almak ve kariyerinizde yeni bir zirveye ulaşmak için ilk adımı atın.
          </p>
        </div>
      </section>

      {/* WHY US SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 group">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Sürekli Gelişim</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Modern teknolojiler ve sürekli eğitim olanakları ile yeteneklerinizi her gün bir adım öteye taşıyın.</p>
            </div>
            
            <div className="space-y-4 group">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Güçlü Kültür</h3>
              <p className="text-slate-500 text-sm leading-relaxed">İşbirliği ve saygıya dayalı, şeffaf ve destekleyici bir çalışma ortamında potansiyelinizi keşfedin.</p>
            </div>

            <div className="space-y-4 group">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Global Vizyon</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Dünya standartlarında projeler üreterek global ölçekte değer yaratan bir ekibin parçası olun.</p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION FORM SECTION */}
      <section className="pb-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto mt-20 relative z-20">
            <div className="flex flex-col lg:flex-row items-stretch gap-0 overflow-hidden rounded-[2rem] shadow-2xl">
              {/* Left Side: Info */}
              <div className="lg:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between space-y-12">
                <div className="space-y-6">
                   <Briefcase size={40} className="text-slate-500" />
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                     Hemen <br /> Başvur
                   </h2>
                   <p className="text-slate-400 text-sm font-medium">
                     Aşağıdaki formu eksiksiz doldurarak başvurunuzu bize iletebilirsiniz. Özgeçmişiniz ekibimiz tarafından titizlikle incelenecektir.
                   </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="w-1 h-1 bg-slate-500 rounded-full" />
                    İşlem Süreci
                  </div>
                  <ul className="space-y-3 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    <li className="flex items-center gap-2">1. Form Gönderimi</li>
                    <li className="flex items-center gap-2 text-slate-500 italic">2. Ön İnceleme</li>
                    <li className="flex items-center gap-2 text-slate-500 italic">3. Mülakat Süreci</li>
                  </ul>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="lg:w-2/3 bg-white p-2">
                <CareerForm jobs={jobs} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
