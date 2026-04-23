import { prisma } from "./index";

const services = [
  {
    title: "İşyeri Hekimliği",
    slug: "isyeri-hekimligi",
    summary: "Çalışanlarınızın periyodik muayeneleri ve sağlık takipleri uzman hekimlerimizce yürütülür.",
    order: 1,
    isPublished: true,
    content: `
      <p>İşyeri hekiminin görevi İşyeri Hekimlerinin Görev, Yetki ve Sorumluluklarıyla belirlenmiştir.</p>
      <ul>
        <li>İşverene, iş sağlığı konusunda rehberlik ve danışmanlık yapmak</li>
        <li>Çalışanların işe giriş ve periyodik sağlık muayenelerini yapmak</li>
        <li>Çalışanlara genel sağlık konularında eğitim vermek</li>
        <li>İşin yürütümündeki ergonomik ve psikososyal riskleri değerlendirerek, iş ile işçinin uyumunu sağlamak</li>
        <li>İş sağlığı ve güvenliği kurulu çalışmalarına katılmak</li>
        <li>İşyerindeki gözetim ve denetim sistemi çalışmalarına katılmak</li>
        <li>Kantin, yemekhane, yatakhane, kreş ve emzirme odaları ile soyunma odaları, duş ve tuvaletlerin bakımı ve temizliği konusunda gerekli kontrolleri yapmak</li>
        <li>İş güvenliği öncülüğünde yapılan risk değerlendirmesi çalışmalarına katılmak</li>
        <li>İşyerindeki risklerin değerlendirilmesi ve önlenmesi ile ilgili mevzuata uygun koruyucu sağlık muayenelerini yapmak</li>
        <li>Gece vardiyaları da dâhil olmak üzere işçilerin sağlık gözetimini yapmak</li>
        <li>İşyerindeki genel hijyen şartlarını denetlemek</li>
        <li>İşyeri Hekimi yıllık çalışma planı hazırlamak</li>
        <li>İşyeri Hekimi yıllık eğitim planı hazırlamak</li>
      </ul>
    `
  },
  {
    title: "İş Güvenliği Uzmanlığı",
    slug: "isg-uzmanligi",
    summary: "Yasal mevzuat çerçevesinde iş güvenliği danışmanlığı ve saha denetim hizmetleri.",
    order: 2,
    isPublished: true,
    content: `
      <p>İş Güvenliği Uzmanı, şirketinizin iş güvenliği mevzuatına uyumunu kontrol etmekten ve belirlediği uygunsuzlukları ilgili mercilere iletmekle sorumlu kişidir.</p>
      <p><strong>İş Güvenliği Uzmanının görevleri;</strong></p>
      <ul>
        <li>Teknik Konular ve Genel Konular ile iş risklerine bağlı gelişebilecek iş kazalarından korunma hakkında eğitim vermek.</li>
        <li>İşyerinde gözetim ve denetim sistemi kurmak ve yönetmek</li>
        <li>İş Sağlığı ve Güvenliği Kurulu çalışmalarına katılmak</li>
        <li>Yıllık Çalışma Planı hazırlamak</li>
        <li>Eğitim Planı hazırlamak</li>
        <li>İşverene, iş güvenliği konusunda rehberlik ve danışmanlık yapmak</li>
        <li>Alt işverenlerin denetimini yaparak yönetime rapor sunmak</li>
        <li>Risk değerlendirme ekibine rehberlik yapmak</li>
        <li>Acil Durum Planı hazırlamak</li>
        <li>İş Sağlığı ve Güvenliği İç Yönetmelik hazırlamak</li>
        <li>İş İzni Prosedürü hazırlamak</li>
        <li>Çalışma talimatları hazırlamak</li>
        <li>İş kazası sonrasında Kaza Kök Sebep Analiz Formunu düzenlemek</li>
        <li>Parlayıcı, patlayıcı, yanıcı ve tehlikeli maddelerle çalışma şartlarını belirlemek</li>
        <li>Kişisel koruyucu donanım risk değerlendirmesi yapmak</li>
        <li>Kişisel koruyucu donanım seçimi konusunda işverene tavsiyede bulunmak</li>
        <li>Elektrik güvenliği ile ilgili gerekli çalışmaları yapmak</li>
        <li>Topraklama tesisatının periyodik kontrollerini takip etmek</li>
        <li>Paratonerin periyodik kontrollerini takip etmek</li>
        <li>İş makinelerinin periyodik kontrollerini takip etmek</li>
        <li>Kaldırma makinelerinin periyodik kontrollerini takip etmek</li>
        <li>Basınçlı kaplar ve kazanların periyodik kontrollerini takip etmek</li>
        <li>Acil Durum Planı kapsamında çalışanları bilgilendirmek ve işverene yol göstermek</li>
      </ul>
    `
  },
  {
    title: "Yardımcı Sağlık Personeli",
    slug: "yardimci-saglik-personeli",
    summary: "İş sağlığı ve güvenliği hizmetlerinde işyeri hekiminin asistanlığı ve temel sağlık takipleri.",
    order: 3,
    isPublished: true,
    content: `
      <p>Yardımcı sağlık personeli aşağıdaki işleri yapar:</p>
      <ul>
        <li>İş sağlığı ve güvenliği hizmetlerinin planlanması, değerlendirilmesi, izlenmesi işlemlerinde işyeri hekiminin talimatları doğrultusunda çalışmak</li>
        <li>İş sağlığı konusunda veri toplamak ve gerekli kayıtları tutmak</li>
        <li>İşyeri hekiminin yaptığı işe giriş ve periyodik muayeneler için işyeri hekimine asistanlık yapmak</li>
        <li>İşyeri hijyenini devamlı olarak kontrol etmek</li>
        <li>İlkyardım hizmetlerinin organizasyonunda görev almak</li>
        <li>İş sağlığı eğitimlerinde görev almak</li>
      </ul>
    `
  },
  {
    title: "Risk Analizi",
    slug: "risk-analizi",
    summary: "İş yerindeki olası risklerin saptanması ve bilimsel yöntemlerle derecelendirilmesi.",
    order: 4,
    isPublished: true,
    content: `
      <p>İş yerinizde var olan ya da dışarıdan gelebilecek tehlikelerin belirlenmesi, bu tehlikelerin riske dönüşmesine yol açan faktörler ile tehlikelerden kaynaklanan risklerin analiz edilerek derecelendirilmesi ve kontrol tedbirlerinin kararlaştırılması amacıyla yapılması gerekli çalışmalardır.</p>
      <p>Uzman ekibimiz, işyerinizin tehlike sınıfına ve çalışma koşullarına uygun olarak detaylı risk analizleri hazırlar ve yasal mevzuata uygun şekilde raporlar.</p>
    `
  },
  {
    title: "İSG Eğitimleri",
    slug: "isg-egitimleri",
    summary: "Temel İSG eğitimlerinden ilkyardım ve yangın eğitimlerine kadar geniş yelpaze.",
    order: 5,
    isPublished: true,
    content: `
      <p>Çalışanların iş sağlığı ve güvenliği eğitimleri, ilgili yönetmelik kapsamında düzenli olarak verilmektedir. Amacımız sadece sertifikasyon değil, çalışanlarda gerçek bir güvenlik kültürü oluşturmaktır.</p>
      <ul>
        <li>Temel İSG Eğitimi</li>
        <li>Yüksekte Çalışma Eğitimi</li>
        <li>Yangın ve Acil Durum Eğitimi</li>
        <li>İlkyardım Farkındalık Eğitimi</li>
        <li>Ergonomi ve Hijyen Eğitimi</li>
      </ul>
    `
  },
  {
    title: "Mobil Sağlık",
    slug: "mobil-saglik",
    summary: "İş yerinde hızlı ve teknolojik sağlık tarama (akciğer filmi, işitme testi vb.) hizmetleri.",
    order: 6,
    isPublished: true,
    content: `
      <p>İş yerinizden ayrılmadan, tam donanımlı mobil sağlık araçlarımızla çalışanlarınızın tüm periyodik sağlık taramalarını gerçekleştiriyoruz.</p>
      <p>Zaman kaybını ve iş gücü kaybını önlemek amacıyla yapılan başlıca tetkikler:</p>
      <ul>
        <li>Akciğer Grafisi</li>
        <li>Odyometri (İşitme Testi)</li>
        <li>Solunum Fonksiyon Testi (SFT)</li>
        <li>Kan ve İdrar Tahlilleri</li>
        <li>Göz Muayenesi</li>
        <li>Portör Muayenesi</li>
      </ul>
    `
  },
  {
    title: "Acil Durum Planı",
    slug: "acil-durum-plani",
    summary: "Olası afet ve acil durumlar için stratejik kaçış, müdahale ve tahliye planlaması.",
    order: 7,
    isPublished: true,
    content: `
      <p>İşyerlerinde meydana gelebilecek acil durumlarda yapılacak iş ve işlemler ile uygulamaya yönelik eylemlerin yer aldığı planlar hazırlıyor ve düzenli tahliye tatbikatları gerçekleştiriyoruz.</p>
      <p><strong>Kapsam:</strong></p>
      <ul>
        <li>Yangın, deprem, sel gibi doğal afet senaryoları</li>
        <li>Kimyasal sızıntı veya patlama durumları</li>
        <li>İş kazası ve ilkyardım gerektiren durumlar</li>
        <li>Acil durum ekiplerinin (söndürme, kurtarma, koruma, ilkyardım) oluşturulması ve eğitimi</li>
        <li>Tahliye planlarının ve toplanma alanlarının belirlenmesi</li>
      </ul>
    `
  }
];

async function main() {
  console.log("Adding services...");
  
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        summary: service.summary,
        content: service.content,
        order: service.order,
        isPublished: service.isPublished,
      },
      create: service,
    });
    console.log("Added/Updated: " + service.title);
  }
  
  console.log("Services seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
