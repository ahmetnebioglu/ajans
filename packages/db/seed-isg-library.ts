import type { PrismaClient } from "@prisma/client";

const categories = [
  { id: "isg-cat-idari-para", name: "İdari Para Cezaları", slug: "idari-para-cezalari", order: 1 },
  { id: "isg-cat-egitim-sorulari", name: "İSG Eğitim Soruları", slug: "isg-egitim-sorulari", order: 2 },
  { id: "isg-cat-bilgilendirme", name: "Bilgilendirmeler", slug: "bilgilendirmeler", order: 3 },
  { id: "isg-cat-videolar", name: "İSG Videoları", slug: "isg-videolari", order: 4 },
  { id: "isg-cat-kkd", name: "Kişisel Koruyucu Donanım Zimmet Formları & Talimatları", slug: "kkd-zimmet-formlari", order: 5 },
  { id: "isg-cat-sunumlar", name: "Eğitim Sunumları", slug: "egitim-sunumlari", order: 6 },
  { id: "isg-cat-kontrol", name: "Kontrol Formları", slug: "kontrol-formlari", order: 7 },
  { id: "isg-cat-talimat", name: "Talimat", slug: "talimat", order: 8 },
  { id: "isg-cat-csgb", name: "ÇSGB Yayınları", slug: "csgb-yayinlari", order: 9 },
  { id: "isg-cat-is-sagligi", name: "İş Sağlığı", slug: "is-sagligi", order: 10 },
  { id: "isg-cat-temsilci", name: "Çalışan Temsilcisi", slug: "calisan-temsilcisi", order: 11 },
  { id: "isg-cat-atama", name: "Atama/Görevlendirme Yazıları", slug: "atama-gorevlendirme-yazilari", order: 12 },
  { id: "isg-cat-katilim", name: "Eğitim Katılım Formları", slug: "egitim-katilim-formlari", order: 13 },
] as const;

type DocumentSeed = {
  id: string;
  title: string;
  categoryId: string;
  fileType: string;
  driveFileId: string;
};

const documents: DocumentSeed[] = [
  // İdari Para Cezaları
  {
    id: "isg-doc-idari-6331",
    title: "6331 İş Güvenliği Kanunu İdari Para Cezaları (2019)",
    categoryId: "isg-cat-idari-para",
    fileType: "PDF",
    driveFileId: "1SeedIsgIdari63312019ParaCezalari01",
  },
  {
    id: "isg-doc-idari-4857",
    title: "4857 İş Kanunu İdari Para Cezaları (2019)",
    categoryId: "isg-cat-idari-para",
    fileType: "PDF",
    driveFileId: "1SeedIsgIdari48572019ParaCezalari01",
  },
  {
    id: "isg-doc-idari-5510",
    title: "5510 Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu İdari Para Cezaları (2019)",
    categoryId: "isg-cat-idari-para",
    fileType: "PDF",
    driveFileId: "1SeedIsgIdari55102019ParaCezalari01",
  },

  // İSG Eğitim Soruları
  {
    id: "isg-doc-egitim-guvenli-surus",
    title: "Güvenli Sürüş Eğitim Sonu Değerlendirme Testi Soruları",
    categoryId: "isg-cat-egitim-sorulari",
    fileType: "PDF",
    driveFileId: "1SeedIsgEgitimGuvenliSurusTesti01",
  },
  {
    id: "isg-doc-egitim-is-sagligi",
    title: "İş Sağlığı Testi Soruları",
    categoryId: "isg-cat-egitim-sorulari",
    fileType: "PDF",
    driveFileId: "1SeedIsgEgitimIsSagligiTesti01",
  },
  {
    id: "isg-doc-egitim-depo",
    title: "Depo Çalışanları İş Güvenliği Testi Soruları",
    categoryId: "isg-cat-egitim-sorulari",
    fileType: "PDF",
    driveFileId: "1SeedIsgEgitimDepoCalisanlari01",
  },
  {
    id: "isg-doc-egitim-sera",
    title: "Sera Çalışanları İş Sağlığı Testi Soruları",
    categoryId: "isg-cat-egitim-sorulari",
    fileType: "PDF",
    driveFileId: "1SeedIsgEgitimSeraCalisanlari01",
  },
  {
    id: "isg-doc-egitim-forklift",
    title: "Forklift Kullanılan Alanlarda Güvenli Çalışma Testi",
    categoryId: "isg-cat-egitim-sorulari",
    fileType: "PDF",
    driveFileId: "1SeedIsgEgitimForkliftAlani01",
  },
  {
    id: "isg-doc-egitim-vinc",
    title: "Sepetli Vinç, Manlift, Personel Yükselticilerde Çalışma Soruları",
    categoryId: "isg-cat-egitim-sorulari",
    fileType: "PDF",
    driveFileId: "1SeedIsgEgitimSepetliVinc01",
  },

  // Bilgilendirmeler
  {
    id: "isg-doc-bilgi-myk",
    title: "6111 Sayılı Kanun Kapsamında MYK Teşviklerinden Yararlanma Kılavuzu",
    categoryId: "isg-cat-bilgilendirme",
    fileType: "PDF",
    driveFileId: "1SeedIsgBilgiMykTesvikKilavuzu01",
  },
  {
    id: "isg-doc-bilgi-6331",
    title: "6331 Sayılı İş Sağlığı ve Güvenliği Kanununa Göre İşverenler Ne Yapmalı?",
    categoryId: "isg-cat-bilgilendirme",
    fileType: "PDF",
    driveFileId: "1SeedIsgBilgi6331IsverenRehber01",
  },
  {
    id: "isg-doc-bilgi-sgk-kod",
    title: "2019 SGK Meslek Kodları",
    categoryId: "isg-cat-bilgilendirme",
    fileType: "PDF",
    driveFileId: "1SeedIsgBilgiSgkMeslekKodlari01",
  },
  {
    id: "isg-doc-bilgi-defter",
    title: "Onaylı (Öneri Tespit) Defter Nasıl Onaylatılır?",
    categoryId: "isg-cat-bilgilendirme",
    fileType: "PDF",
    driveFileId: "1SeedIsgBilgiOnayliDefterRehber01",
  },

  // İSG Videoları
  {
    id: "isg-doc-video-lpg",
    title: "LPG Tüpü Yangın Dik - Yatık Söndürülmesi",
    categoryId: "isg-cat-videolar",
    fileType: "MP4",
    driveFileId: "1SeedIsgVideoLpgTupuYangin01",
  },
  {
    id: "isg-doc-video-mutfak-su",
    title: "Mutfak Yangını - Yanmakta Olan Yağa Su Dökülürse Ne Olur?",
    categoryId: "isg-cat-videolar",
    fileType: "MP4",
    driveFileId: "1SeedIsgVideoMutfakYaginaSu01",
  },
  {
    id: "isg-doc-video-tatbikat",
    title: "Yangın Tatbikatı Kazaları / Hataları",
    categoryId: "isg-cat-videolar",
    fileType: "MP4",
    driveFileId: "1SeedIsgVideoYanginTatbikati01",
  },
  {
    id: "isg-doc-video-tava",
    title: "Mutfak Yangını - İçinde Yağ Olan Tava Alev Alırsa Nasıl Söndürülür",
    categoryId: "isg-cat-videolar",
    fileType: "MP4",
    driveFileId: "1SeedIsgVideoMutfakTavaAlev01",
  },
  {
    id: "isg-doc-video-uzman",
    title: "İSG Eğitimini Ciddiye Almayan Çalışanların Arkasından Konuşan Uzman (Temsili)",
    categoryId: "isg-cat-videolar",
    fileType: "MP4",
    driveFileId: "1SeedIsgVideoEgitimTemsili01",
  },
  {
    id: "isg-doc-video-kola",
    title: "Kola (Gazlı İçecek) ile Yangın Söndürme",
    categoryId: "isg-cat-videolar",
    fileType: "MP4",
    driveFileId: "1SeedIsgVideoKolaYangin01",
  },

  // KKD Zimmet Formları
  {
    id: "isg-doc-kkd-toz-maskesi",
    title: "Toz Maskesi KKD Zimmet Formu",
    categoryId: "isg-cat-kkd",
    fileType: "PDF",
    driveFileId: "1SeedIsgKkdTozMaskesiZimmet01",
  },
  {
    id: "isg-doc-kkd-kulak",
    title: "Kulak Tıkacı KKD Zimmet Formu",
    categoryId: "isg-cat-kkd",
    fileType: "PDF",
    driveFileId: "1SeedIsgKkdKulakTikaciZimmet01",
  },
  {
    id: "isg-doc-kkd-ayakkabi",
    title: "İş Ayakkabısı KKD Zimmet Formu",
    categoryId: "isg-cat-kkd",
    fileType: "PDF",
    driveFileId: "1SeedIsgKkdIsAyakkabisiZimmet01",
  },
  {
    id: "isg-doc-kkd-kemer",
    title: "Paraşüt Tipi (Tam Vücut) Emniyet Kemeri KKD Zimmet Formu",
    categoryId: "isg-cat-kkd",
    fileType: "PDF",
    driveFileId: "1SeedIsgKkdEmniyetKemeriZimmet01",
  },

  // Eğitim Sunumları
  {
    id: "isg-doc-sunum-forklift",
    title: "Güvenli Forklift Kullanma Eğitimi",
    categoryId: "isg-cat-sunumlar",
    fileType: "PPTX",
    driveFileId: "1SeedIsgSunumGuvenliForklift01",
  },
  {
    id: "isg-doc-sunum-yangin",
    title: "Yangın Güvenliği Temel Eğitimi",
    categoryId: "isg-cat-sunumlar",
    fileType: "PPTX",
    driveFileId: "1SeedIsgSunumYanginGuvenligi01",
  },

  // Kontrol Formları
  {
    id: "isg-doc-kontrol-yangin-tupu",
    title: "Yangın Söndürme Tüpleri Aylık Kontrol Formu",
    categoryId: "isg-cat-kontrol",
    fileType: "PDF",
    driveFileId: "1SeedIsgKontrolYanginTupuAylik01",
  },

  // Talimat
  {
    id: "isg-doc-talimat-arac",
    title: "Şirket Aracı Kullanma İSG Talimatı",
    categoryId: "isg-cat-talimat",
    fileType: "PDF",
    driveFileId: "1SeedIsgTalimatSirketAraci01",
  },

  // ÇSGB Yayınları
  {
    id: "isg-doc-csgb-yuksekten",
    title: "Yapı İşlerinde Yüksekten Düşmeyi Önleme Sistemleri",
    categoryId: "isg-cat-csgb",
    fileType: "PDF",
    driveFileId: "1SeedIsgCsgbYuksektenDusme01",
  },
  {
    id: "isg-doc-csgb-el-kitabi",
    title: "ÇSGB Yapı Sektörü İş Güvenliği El Kitabı",
    categoryId: "isg-cat-csgb",
    fileType: "PDF",
    driveFileId: "1SeedIsgCsgbYapiSektoruElKitabi01",
  },

  // İş Sağlığı
  {
    id: "isg-doc-saglik-ecza",
    title: "Ecza Dolabındaki Sarf Malzemesinde Dikkat Edilmesi Gerekenler",
    categoryId: "isg-cat-is-sagligi",
    fileType: "PDF",
    driveFileId: "1SeedIsgSaglikEczaDolabi01",
  },
  {
    id: "isg-doc-saglik-tetanos",
    title: "Tetanos Aşısı Beyan / Talep Formu",
    categoryId: "isg-cat-is-sagligi",
    fileType: "PDF",
    driveFileId: "1SeedIsgSaglikTetanosAsisi01",
  },

  // Çalışan Temsilcisi
  {
    id: "isg-doc-temsilci-duyuru",
    title: "Çalışan Temsilcisi Seçim ve Aday Duyurusu",
    categoryId: "isg-cat-temsilci",
    fileType: "PDF",
    driveFileId: "1SeedIsgTemsilciSecimDuyurusu01",
  },
  {
    id: "isg-doc-temsilci-cizelge",
    title: "Çalışan Temsilcisi Seçmen Takip Çizelgesi",
    categoryId: "isg-cat-temsilci",
    fileType: "PDF",
    driveFileId: "1SeedIsgTemsilciSecmenCizelgesi01",
  },
];

export async function seedIsgLibrary(prisma: PrismaClient) {
  console.log(">>> İSG Kütüphanesi seed başlıyor...");

  for (const category of categories) {
    await prisma.isgCategory.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        slug: category.slug,
        order: category.order,
      },
      create: category,
    });
  }
  console.log(`>>> ${categories.length} kategori oluşturuldu/güncellendi.`);

  for (const doc of documents) {
    await prisma.isgDocument.upsert({
      where: { id: doc.id },
      update: {
        title: doc.title,
        categoryId: doc.categoryId,
        fileType: doc.fileType,
        driveFileId: doc.driveFileId,
        isPublished: true,
      },
      create: {
        ...doc,
        isPublished: true,
      },
    });
  }
  console.log(`>>> ${documents.length} belge oluşturuldu/güncellendi.`);
}
