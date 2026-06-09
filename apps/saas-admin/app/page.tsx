import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <h1>SaaS Yönetim Paneli</h1>
        <p>
          Bu panel, paket seçimi, abonelik yönetimi ve ödeme durumları için bir
          başlangıç sayfasıdır.
        </p>
      </section>

      <section className="cards">
        <article className="card">
          <h2>Paketler</h2>
          <p>Mevcut SaaS paketlerini görüntüleyin ve yeni paketler ekleyin.</p>
          <Link href="/packages">Paketleri Yönet</Link>
        </article>

        <article className="card">
          <h2>Ödemeler</h2>
          <p>
            Ödeme durumu, fatura bilgileri ve entegrasyon ayarlarını yönetin.
          </p>
          <Link href="/payments">Ödemelere Git</Link>
        </article>
      </section>
    </main>
  );
}
