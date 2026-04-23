import { prisma, SectionType } from '../index';
import * as cheerio from 'cheerio';

const pagesToScrape = [
  {
    url: 'https://mercanosgb.com/kurumsal/',
    slug: 'kurumsal',
    title: 'Kurumsal',
    type: SectionType.CONTENT,
  },
  {
    url: 'https://mercanosgb.com/is-sagligi-ve-guvenligi-hizmetleri/',
    slug: 'hizmetlerimiz',
    title: 'İş Sağlığı ve Güvenliği Hizmetleri',
    type: SectionType.FEATURES,
  },
  {
    url: 'https://mercanosgb.com/iletisim/',
    slug: 'iletisim',
    title: 'İletişim',
    type: SectionType.CONTENT,
  }
];

async function extractContent(url: string, type: SectionType): Promise<any> {
  console.log(`🌐 Veri çekiliyor (Scraping): ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    if (type === SectionType.CONTENT) {
      let contentHtml = '';
      
      // WordPress/Elementor yapısına uygun genel text widget'larını al
      const textWidgets = $('.elementor-widget-text-editor .elementor-text-editor, .elementor-widget-theme-post-content');
      
      if (textWidgets.length > 0) {
        contentHtml = textWidgets.map((i, el) => $(el).html()).get().join('<br/><br/>');
      } else {
        // Fallback: Ana içerikteki tüm p tag'lerini topla
        contentHtml = $('main p, .content p, article p, .container p').map((i, el) => $(el).prop('outerHTML')).get().join('');
      }

      // Çok boşluklu alanları temizle
      contentHtml = contentHtml.replace(/\n\s*\n/g, '\n');

      return {
        description: contentHtml || '<p><i>İçerik otomatik kazınamadı, lütfen CMS üzerinden manuel güncelleyiniz.</i></p>',
        title: "",
        image: "",
        items: []
      };
    } else if (type === SectionType.FEATURES) {
      const features: Array<{title: string, description: string}> = [];
      
      // WordPress Icon Box veya benzeri bileşenlerden başlık ve metin çıkarma
      $('.elementor-widget-icon-box').each((i, el) => {
        const title = $(el).find('.elementor-icon-box-title').text().trim();
        const description = $(el).find('.elementor-icon-box-description').text().trim();
        if (title) {
          features.push({ title, description });
        }
      });

      // Eğer icon box bulunamazsa, başlık-paragraf ikililerini tara
      if (features.length === 0) {
        $('h2, h3, .elementor-heading-title').each((i, el) => {
          const title = $(el).text().trim();
          // Sonraki gelen ilk P etiketini veya text editor'u açıklama olarak al
          const description = $(el).closest('.elementor-widget').nextAll('.elementor-widget-text-editor').first().text().trim() 
                              || $(el).nextAll('p').first().text().trim();
          
          // Sadece mantıklı uzunlukta olanları feature olarak al
          if (title && title.length > 3 && description && description.length > 10) {
             features.push({ title, description });
          }
        });
      }

      return {
        title: "Hizmetlerimiz",
        description: "",
        image: "",
        items: features.length > 0 ? features : [
          { title: "İş Sağlığı", description: "Hizmet detayı CMS üzerinden güncellenebilir." },
          { title: "İş Güvenliği", description: "Hizmet detayı CMS üzerinden güncellenebilir." }
        ]
      };
    }

    return {};
  } catch (error) {
    console.error(`❌ Hata oluştu (${url}):`, error);
    return { description: '<p>Hata oluştu. Veri çekilemedi.</p>', title: "", items: [] };
  }
}

async function main() {
  console.log("🚀 Veri Aktarımı (Data Migration) başlatılıyor...\n");
  
  for (const pageDef of pagesToScrape) {
    const sectionContent = await extractContent(pageDef.url, pageDef.type);
    
    console.log(`💾 Veritabanına yazılıyor: ${pageDef.title}`);
    
    // Sayfayı varsa güncelle, yoksa oluştur (Upsert)
    const page = await prisma.page.upsert({
      where: { slug: pageDef.slug },
      update: {
        title: pageDef.title,
        isPublished: true, // ZORUNLU KURAL: Tüm sayfalar yayında
      },
      create: {
        slug: pageDef.slug,
        title: pageDef.title,
        isPublished: true, // ZORUNLU KURAL: Tüm sayfalar yayında
      }
    });

    // Önceki otomatik bölümleri temizle ki mükerrer kayıt olmasın
    await prisma.section.deleteMany({
      where: { pageId: page.id }
    });

    // İçeriği Section modeline yaz
    await prisma.section.create({
      data: {
        pageId: page.id,
        type: pageDef.type,
        order: 1,
        content: sectionContent as any
      }
    });
    
    console.log(`✅ Başarıyla aktarıldı: ${pageDef.title}\n`);
  }

  console.log("🎉 Veri aktarımı başarıyla tamamlandı.");
}

main()
  .catch(e => {
    console.error("Migration Script Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
