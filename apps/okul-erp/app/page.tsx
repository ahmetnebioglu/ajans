import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GraduationCap, Users, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-[2px] flex items-center justify-center text-white font-black italic text-lg shadow-lg">O</div>
            <span className="text-sm font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">OKUL <span className="text-blue-600">ERP</span></span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="flex items-center gap-2 px-6 py-2 rounded-[2px] border border-zinc-800 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-zinc-900/20">
              <LogIn className="w-3.5 h-3.5" />
              <span>SİSTEME GİRİŞ</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 px-6 bg-slate-50 relative overflow-hidden border-b border-slate-100">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white skew-x-12 translate-x-1/2 -z-10" />
          <div className="container mx-auto text-center max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-[2px] border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
               DİJİTAL OKUL YÖNETİMİ
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-[0.9] text-zinc-900">
              Güvenli ve Hızlı <br/> <span className="text-blue-600">Okul İzin</span> Yönetimi
            </h1>
            <p className="text-lg text-slate-500 italic font-medium leading-relaxed max-w-2xl mx-auto">
              Veli, öğretmen ve idare arasındaki izin süreçlerini dijitalleştirin. 
              Mutabakat esaslı, şeffaf ve güvenilir izin yönetim sistemi.
            </p>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Veli Kartı */}
            <div className="group p-8 rounded-[2px] border border-slate-100 bg-white hover:border-blue-600 transition-all hover:-translate-y-1.5 shadow-sm">
              <div className="w-12 h-12 rounded-[2px] bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-4">Veliler İçin</h2>
              <ul className="space-y-3 text-slate-500 text-xs italic font-medium mb-8">
                <li>• Anında izin talebi oluşturma</li>
                <li>• Onay süreçlerini takip etme</li>
                <li>• Geçmiş izin kayıtları</li>
              </ul>
              <Link href="/login" className="block text-center py-3.5 rounded-[2px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                VELİ GİRİŞİ
              </Link>
            </div>

            {/* Öğretmen Kartı */}
            <div className="group p-8 rounded-[2px] border border-slate-100 bg-white hover:border-blue-600 transition-all hover:-translate-y-1.5 shadow-sm">
              <div className="w-12 h-12 rounded-[2px] bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-4">Öğretmenler İçin</h2>
              <ul className="space-y-3 text-slate-500 text-xs italic font-medium mb-8">
                <li>• Sınıf izinlerini görüntüleme</li>
                <li>• Devamsızlık kontrolü</li>
                <li>• İdare ile koordinasyon</li>
              </ul>
              <Link href="/login" className="block text-center py-3.5 rounded-[2px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                ÖĞRETMEN GİRİŞİ
              </Link>
            </div>

            {/* İdareci Kartı */}
            <div className="group p-8 rounded-[2px] border border-slate-100 bg-white hover:border-blue-600 transition-all hover:-translate-y-1.5 shadow-sm">
              <div className="w-12 h-12 rounded-[2px] bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-4">İdareciler İçin</h2>
              <ul className="space-y-3 text-slate-500 text-xs italic font-medium mb-8">
                <li>• Genel okul izin yönetimi</li>
                <li>• İstatistik ve raporlama</li>
                <li>• Güvenlik denetimleri</li>
              </ul>
              <Link href="/login" className="block text-center py-3.5 rounded-[2px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                İDARECİ GİRİŞİ
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-slate-50">
        <div className="container mx-auto px-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
          <p>© 2026 Okul İzin Mutabakat Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
