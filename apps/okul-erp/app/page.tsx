import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GraduationCap, Users, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Okul İzin</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-accent transition-colors">
              <LogIn className="w-4 h-4" />
              <span>Giriş Yap</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 bg-linear-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Güvenli ve Hızlı Okul İzin Yönetimi
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Veli, öğretmen ve idare arasındaki izin süreçlerini dijitalleştirin. 
              Mutabakat esaslı, şeffaf ve güvenilir izin yönetim sistemi.
            </p>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Veli Kartı */}
            <div className="group p-8 rounded-3xl border bg-card hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Veliler İçin</h2>
              <ul className="space-y-3 text-muted-foreground mb-8">
                <li>• Anında izin talebi oluşturma</li>
                <li>• Onay süreçlerini takip etme</li>
                <li>• Geçmiş izin kayıtları</li>
              </ul>
              <Link href="/auth/veli" className="block text-center py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Veli Girişi
              </Link>
            </div>

            {/* Öğretmen Kartı */}
            <div className="group p-8 rounded-3xl border bg-card hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <GraduationCap className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Öğretmenler İçin</h2>
              <ul className="space-y-3 text-muted-foreground mb-8">
                <li>• Sınıf izinlerini görüntüleme</li>
                <li>• Devamsızlık kontrolü</li>
                <li>• İdare ile koordinasyon</li>
              </ul>
              <Link href="/auth/ogretmen" className="block text-center py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition-opacity border border-secondary-foreground/10">
                Öğretmen Girişi
              </Link>
            </div>

            {/* İdareci Kartı */}
            <div className="group p-8 rounded-3xl border bg-card hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:bg-accent/80 transition-colors">
                <ShieldCheck className="w-6 h-6 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">İdareciler İçin</h2>
              <ul className="space-y-3 text-muted-foreground mb-8">
                <li>• Genel okul izin yönetimi</li>
                <li>• İstatistik ve raporlama</li>
                <li>• Güvenlik denetimleri</li>
              </ul>
              <Link href="/auth/idare" className="block text-center py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity">
                İdareci Girişi
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 Okul İzin Mutabakat Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
