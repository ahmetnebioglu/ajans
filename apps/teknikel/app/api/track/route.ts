import { NextRequest, NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';
import { InteractionType, LeadStatus } from '@prisma/client';

/**
 * Lead Takip ve Skorlama API'si
 * Örn: /api/track?leadId=123&targetUrl=https://ideasoft.com.tr&type=CLICK
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');
  const targetUrl = searchParams.get('targetUrl');
  const typeParam = (searchParams.get('type') || 'CLICK') as InteractionType;

  // Temel doğrulama
  if (!leadId || !targetUrl) {
    return NextResponse.json(
      { error: 'leadId ve targetUrl parametreleri zorunludur.' }, 
      { status: 400 }
    );
  }

  try {
    // SQL Transaction (Global Rule: Tüm DB değişikliklerinde kullanılmalı)
    await db.$transaction(async (tx) => {
      // 1. Etkileşimi logla
      await tx.leadInteraction.create({
        data: {
          leadId,
          type: typeParam,
          metadata: { targetUrl },
        },
      });

      // 2. Lead skorunu ve statüsünü güncelle
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
      });

      if (lead) {
        let nextStatus = lead.status;
        
        // İş akışı mantığı: NEW veya CONTACTED -> HOT
        if (lead.status === LeadStatus.NEW || lead.status === LeadStatus.CONTACTED) {
          nextStatus = LeadStatus.HOT;
        }

        await tx.lead.update({
          where: { id: leadId },
          data: {
            interactionScore: { increment: 10 },
            lastActivityAt: new Date(),
            status: nextStatus,
          },
        });
      }
    });

    // Başarılı işlem sonrası yönlendirme
    return NextResponse.redirect(new URL(targetUrl));
  } catch (error) {
    console.error('[Tracking API Error]:', error);
    
    // Hata durumunda bile kullanıcı deneyimini bozmamak için yönlendir
    try {
      return NextResponse.redirect(new URL(targetUrl));
    } catch (redirectError) {
      // Geçersiz URL durumunda fallback
      return NextResponse.json({ error: 'Geçersiz hedef URL' }, { status: 400 });
    }
  }
}
