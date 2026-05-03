'use server';

import { unsecured_prisma as db } from '@ajans/db';
import { revalidatePath } from 'next/cache';
import { 
  getBilsoftCariler, 
  normalizePhone, 
  normalizeString, 
  BilsoftCari, 
  getBilsoftTokenStatus,
  addBilsoftCari,
  BilsoftCariInsertPayload
} from '@/src/services/bilsoft';

/**
 * Bilsoft sistemine yeni cari ekler.
 */
export async function createCariAction(payload: Partial<BilsoftCariInsertPayload>) {
  try {
    const result = await addBilsoftCari(payload);
    revalidatePath('/cariler');
    return result;
  } catch (error) {
    return { success: false, message: "İşlem sırasında bir hata oluştu." };
  }
}

interface SyncResult {
  success: boolean;
  message: string;
  processedCount: number;
  matchedCount: number;
}

/**
 * CRM Lead'lerini Bilsoft Carileri ile eşleştirir ve skorlar.
 * SQL Transaction kullanarak veri bütünlüğünü korur.
 */
export async function syncAndScoreLeads(): Promise<SyncResult> {
  try {
    console.log('[BilsoftActions] Senkronizasyon başlatıldı...');

    // 1. Bilsoft'tan güncel carileri çek (Senkronizasyon için geniş kapsamlı çekiyoruz)
    const { data: bilsoftCaris } = await getBilsoftCariler("", 1, 5000);
    if (!bilsoftCaris || bilsoftCaris.length === 0) {
      return {
        success: false,
        message: 'Bilsoft cari listesi alınamadı veya boş.',
        processedCount: 0,
        matchedCount: 0,
      };
    }

    // 2. CRM'deki tüm aktif lead'leri çek
    const leads = await db.lead.findMany({
      where: { deletedAt: null },
    });

    let matchedCount = 0;

    // 3. Eşleştirme ve Güncelleme İşlemi (Transaction)
    await db.$transaction(async (tx) => {
      for (const lead of leads) {
        let match: BilsoftCari | null = null;
        let scoreBonus = 0;

        // Normalizasyon
        const leadPhoneNorm = normalizePhone(lead.phone);
        const leadNameNorm = normalizeString(lead.name);
        const leadCompanyNorm = normalizeString(lead.companyName);

        // A. Telefon ile eşleştirme (En güvenilir)
        if (leadPhoneNorm) {
          match = bilsoftCaris.find(
            (c) => normalizePhone(c.cep) === leadPhoneNorm || normalizePhone(c.tel) === leadPhoneNorm
          ) || null;
          
          if (match) scoreBonus += 50;
        }

        // B. İsim/Unvan ile eşleştirme (Telefon tutmazsa)
        if (!match && (leadNameNorm || leadCompanyNorm)) {
          match = bilsoftCaris.find((c) => {
            const cariUnvanNorm = normalizeString(c.faturaUnvan);
            const cariYetkiliNorm = normalizeString(c.yetkili);
            
            return (
              (leadCompanyNorm && cariUnvanNorm.includes(leadCompanyNorm)) ||
              (leadNameNorm && cariYetkiliNorm.includes(leadNameNorm)) ||
              (leadCompanyNorm && cariYetkiliNorm.includes(leadCompanyNorm))
            );
          }) || null;

          if (match) scoreBonus += 30;
        }

        // Eğer eşleşme bulunduysa güncelle
        if (match) {
          matchedCount++;
          
          // VIP Kontrolü
          const isVip = match.grup === 'VIP' || (match.bakiye && match.bakiye > 100000);
          const newStatus = isVip ? 'VIP' : 'ACTIVE';

          await tx.lead.update({
            where: { id: lead.id },
            data: {
              erpId: String(match.id),
              erpCode: match.cariKod,
              status: lead.status === 'PROSPECT' ? newStatus : lead.status, // Sadece Prospect ise güncelle
              score: { increment: scoreBonus },
              updatedAt: new Date(),
            },
          });

          // Etkileşim Logu Ekle
          await tx.interaction.create({
            data: {
              leadId: lead.id,
              type: 'ERP_SYNC',
              scoreAdded: scoreBonus,
              description: `Bilsoft ile eşleşti: ${match.faturaUnvan} (${match.cariKod})`,
            },
          });
        }
      }
    });

    revalidatePath('/leads');
    
    return {
      success: true,
      message: `${leads.length} kayıttan ${matchedCount} tanesi başarıyla eşleştirildi ve skorlandı.`,
      processedCount: leads.length,
      matchedCount: matchedCount,
    };
  } catch (error) {
    console.error('[BilsoftActions] Sync Error:', error);
    return {
      success: false,
      message: `Senkronizasyon hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      processedCount: 0,
      matchedCount: 0,
    };
  }
}


/**
 * Bilsoft API bağlantı durumunu döner.
 */
export async function getBilsoftStatus() {
  try {
    const status = getBilsoftTokenStatus();
    return {
      success: true,
      ...status
    };
  } catch (error) {
    return {
      success: false,
      message: "Durum bilgisi alınamadı."
    };
  }
}

/**
 * Bilsoft yapılandırmasını veritabanından getirir.
 */
export async function getBilsoftConfig() {
  try {
    const config = await db.bilsoftConfig.findUnique({
      where: { tenantId: 'teknikel' }
    });
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Yapılandırma alınamadı." };
  }
}

/**
 * Bilsoft yapılandırmasını günceller.
 */
export async function updateBilsoftConfig(data: any) {
  try {
    const config = await db.bilsoftConfig.upsert({
      where: { tenantId: 'teknikel' },
      update: data,
      create: {
        tenantId: 'teknikel',
        ...data
      }
    });
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: "Yapılandırma güncellenemedi." };
  }
}

