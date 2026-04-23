import { prisma } from '../index';
import * as cheerio from 'cheerio';

async function main() {
  console.log("🚀 NACE Kodları verisi çekiliyor: https://mercanosgb.com/tehlike-siniflari-listesi/");
  try {
    const res = await fetch("https://mercanosgb.com/tehlike-siniflari-listesi/");
    const html = await res.text();
    const $ = cheerio.load(html);

    const naceCodes: { code: string, description: string, hazardClass: string }[] = [];

    // Genellikle tablolar tbody tr içerisinde saklanır
    $('table tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 3) {
        let code = $(tds[0]).text().trim();
        let description = $(tds[1]).text().trim();
        let hazardClass = $(tds[2]).text().trim();
        
        // Temizlik
        code = code.replace(/\s+/g, ' ');
        description = description.replace(/\s+/g, ' ');
        hazardClass = hazardClass.replace(/\s+/g, ' ');

        // Eğer başlık satırı değilse ve geçerli bir NACE koduna benziyorsa
        // (En azından kod sütununda rakam varsa)
        if (code && /\d/.test(code) && description.length > 3) {
           naceCodes.push({ code, description, hazardClass });
        }
      }
    });

    if (naceCodes.length === 0) {
      console.log("❌ NACE kodları bulunamadı (table > tr aranarak). Sayfa yapısı farklı olabilir.");
      return;
    }

    console.log(`✅ ${naceCodes.length} adet NACE kodu bulundu. Veritabanına yazılıyor...`);

    let count = 0;
    for (const item of naceCodes) {
      await prisma.naceCode.upsert({
        where: { code: item.code },
        update: { description: item.description, hazardClass: item.hazardClass },
        create: { code: item.code, description: item.description, hazardClass: item.hazardClass }
      });
      count++;
    }

    console.log(`🎉 Başarıyla ${count} adet NACE kodu eklendi/güncellendi.`);

  } catch (error) {
    console.error("❌ Bir hata oluştu:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
