import { prisma } from '../index';

async function cleanup() {
  console.log("🧹 Veritabanı Temizliği Başlıyor...");
  
  const sections = await prisma.section.findMany();
  let updatedCount = 0;

  for (const section of sections) {
    const content = section.content as any;
    let needsUpdate = false;

    // YENİ FORMAT:
    // { title: string, description: string, image: string, items: array }

    const newContent = {
      title: content.title || "",
      description: content.description || "",
      image: content.image || "",
      items: content.items || []
    };

    if (section.type === 'CONTENT') {
      if (content.html) {
        newContent.description = content.html; // html'i description'a taşı
        needsUpdate = true;
      }
    } else if (section.type === 'FEATURES') {
      if (content.features) {
        newContent.items = content.features; // features'i items'a taşı
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await prisma.section.update({
        where: { id: section.id },
        data: { content: newContent }
      });
      updatedCount++;
      console.log(`✅ Bölüm güncellendi: ${section.id}`);
    }
  }

  console.log(`🎉 Temizlik tamamlandı. Toplam ${updatedCount} bölüm düzeltildi.`);
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
