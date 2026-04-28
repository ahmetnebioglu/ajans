"use server";

import { unsecured_prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";

export async function syncAllLeads() {
  try {
    const leads = await db.lead.findMany({
      include: {
        interactions: true
      }
    });

    console.log(`[SYNC] ${leads.length} lead için etkileşim ayrıştırma ve puan eşitleme başlatılıyor...`);

    let updatedCount = 0;

    for (const lead of leads) {
      // Yeni skor hesaplama: Telefon +10, Web +5
      let newScore = 0;
      if (lead.phone) newScore += 10;
      if (lead.website) newScore += 5;

      const existingTypes = lead.interactions.map(i => i.type);
      const newInteractions = [];

      // 1. CREATED kaydı yoksa ekle
      if (!existingTypes.includes('CREATED')) {
        newInteractions.push({
          type: 'CREATED',
          scoreAdded: 0,
          description: 'Sisteme eklendi (Geriye dönük senkronizasyon)'
        });
      }

      // 2. Telefon puanı kaydı yoksa ekle
      if (lead.phone && !existingTypes.includes('PROFILE_PHONE')) {
        newInteractions.push({
          type: 'PROFILE_PHONE',
          scoreAdded: 10,
          description: 'Telefon numarası bulundu (+10 Puan)'
        });
      }

      // 3. Web sitesi puanı kaydı yoksa ekle
      if (lead.website && !existingTypes.includes('PROFILE_WEB')) {
        newInteractions.push({
          type: 'PROFILE_WEB',
          scoreAdded: 5,
          description: 'Web sitesi bulundu (+5 Puan)'
        });
      }

      // Lead güncelleme ve yeni etkileşimleri ekleme
      await db.lead.update({
        where: { id: lead.id },
        data: { 
          score: newScore,
          interactions: {
            create: newInteractions
          }
        }
      });

      updatedCount++;
    }

    revalidatePath('/leads');
    revalidatePath('/vip');
    revalidatePath('/');

    return { success: true, count: updatedCount };
  } catch (error: any) {
    console.error("[SYNC ERROR]:", error);
    return { success: false, error: error.message };
  }
}
