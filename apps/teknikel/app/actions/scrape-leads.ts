"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getSecuredPrisma } from "@ajans/db";
import { searchBusinesses } from "@ajans/google-api";
import { revalidatePath } from "next/cache";

export interface ScrapeLeadsInput {
  query: string;
  location?: string;
}

export interface ScrapeLeadsResult {
  success: boolean;
  count?: number;
  found?: number;
  message?: string;
  error?: string;
}

/**
 * Google Places üzerinden yeni lead taraması yapar.
 * Kullanıcı oturumu (NextAuth session) ile korunur.
 * Tüm kayıtlar 'teknikel' tenantId'sine yazılır.
 */
export async function scrapeLeads(
  input: ScrapeLeadsInput,
): Promise<ScrapeLeadsResult> {
  // 1. Oturum kontrolü
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Yetkisiz erişim. Lütfen giriş yapın." };
  }

  const { query, location } = input;

  if (!query || query.trim() === "") {
    return {
      success: false,
      error: "Sektör/Anahtar kelime (query) zorunludur.",
    };
  }

  console.log(
    `[SCRAPE] Başlatıldı: Query="${query}", Location="${location || "Belirtilmedi"}", User="${session.user.email}"`,
  );

  try {
    // 2. Google Places API'den verileri çek
    const businesses = await searchBusinesses(
      query.trim(),
      location?.trim() || undefined,
    );

    if (businesses.length === 0) {
      return {
        success: true,
        count: 0,
        found: 0,
        message:
          "Google üzerinde kriterlere uygun yeni bir işletme bulunamadı.",
      };
    }

    let savedCount = 0;
    let errorCount = 0;
    let firstError: string | null = null;

    // 3. RLS-korumalı Prisma instance'ı oluştur
    const db = getSecuredPrisma("teknikel");

    // 4. Veritabanına kaydet
    for (const biz of businesses) {
      try {
        // Dedupe: telefon veya (companyName + name) bazlı kontrol
        // Eğer phone yoksa, sadece companyName + name ile kontrol et
        const dedupeConditions: any[] = [];
        
        if (biz.phone) {
          dedupeConditions.push({ phone: biz.phone });
        }
        
        // companyName ve name her ikisi de varsa, bu kombinasyonla kontrol et
        if (biz.companyName && biz.name) {
          dedupeConditions.push({
            companyName: biz.companyName,
            name: biz.name,
          });
        }

        const existing = dedupeConditions.length > 0 
          ? await db.lead.findFirst({
              where: {
                tenantId: "teknikel",
                OR: dedupeConditions,
              },
            })
          : null;

        if (!existing) {
          // Skor algoritması: Taban 0, Telefon +10, Web +5
          let calculatedScore = 0;
          const interactionData: Array<{
            type: "CREATED" | "PROFILE_PHONE" | "PROFILE_WEB";
            metadata: { scoreAdded: number; description: string };
          }> = [];

          interactionData.push({
            type: "CREATED",
            metadata: {
              scoreAdded: 0,
              description: `Sisteme eklendi (Google Places) — Tarayan: ${session.user.email}`,
            },
          });

          if (biz.phone) {
            calculatedScore += 10;
            interactionData.push({
              type: "PROFILE_PHONE",
              metadata: {
                scoreAdded: 10,
                description: "Telefon numarası bulundu (+10 Puan)",
              },
            });
          }

          if (biz.website) {
            calculatedScore += 5;
            interactionData.push({
              type: "PROFILE_WEB",
              metadata: {
                scoreAdded: 5,
                description: "Web sitesi bulundu (+5 Puan)",
              },
            });
          }

          await db.lead.create({
            data: {
              name: biz.name || "Bilinmeyen Yetkili",
              companyName: biz.companyName,
              phone: biz.phone,
              website: biz.website,
              source: "GOOGLE_PLACES",
              status: "PROSPECT",
              score: calculatedScore,
              tenantId: "teknikel",
              communicationOptIn: false, // KVKK: varsayılan olarak kapalı
              interactions: {
                create: interactionData as any,
              },
            },
          });

          savedCount++;
        }
      } catch (dbError: any) {
        errorCount++;
        const errorMsg = dbError.message || JSON.stringify(dbError);
        if (!firstError) {
          firstError = errorMsg;
        }
        console.error(
          `[SCRAPE DB ERROR] ${biz.companyName} kaydedilirken hata:`,
          errorMsg,
        );
      }
    }

    revalidatePath("/leads");
    revalidatePath("/vip");

    let message = "";
    let success = true;

    if (savedCount > 0) {
      message = `${savedCount} yeni işletme başarıyla sisteme aktarıldı.`;
      if (errorCount > 0) {
        message += ` (${errorCount} kayıt hata aldı${firstError ? `: ${firstError}` : ""})`;
      }
    } else if (errorCount > 0) {
      // Tüm kayıtlar hata aldı
      message = `Tarama başarısız: ${businesses.length} işletme bulundu ancak tamamı kaydedilirken hata aldı.${firstError ? ` Hata: ${firstError}` : ""}`;
      success = false;
    } else {
      // Hiç kayıt kaydedilmedi, hata da yok = zaten var
      message = `${businesses.length} işletme bulundu ancak tamamı zaten sistemde kayıtlı.`;
    }

    console.log(
      `[SCRAPE] Tamamlandı: ${savedCount} yeni, ${errorCount} hata, ${businesses.length} toplam bulundu.`,
    );

    return {
      success,
      count: savedCount,
      found: businesses.length,
      message,
      error: errorCount > 0 && firstError ? firstError : undefined,
    };
  } catch (error: any) {
    console.error("[SCRAPE FATAL ERROR]:", error.message);
    return {
      success: false,
      error: error.message || "Bilinmeyen bir hata oluştu.",
    };
  }
}
