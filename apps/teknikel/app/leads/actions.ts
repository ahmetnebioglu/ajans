'use strict';
'use server';

import { unsecured_prisma as db } from '@ajans/db';
import { sendSms } from '@ajans/core';
import { sendOutreachEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function scheduleCall(leadId: string) {
  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });

    if (!lead) return { success: false, error: 'Lead bulunamadı.' };
    
    // KVKK Check (Kara Liste)
    if (!lead.communicationOptIn) {
      console.log(`[Compliance] ${lead.email || lead.phone} için iletişim izni yok. Gönderim durduruldu.`);
      return { success: false, error: 'Müşteri iletişim izinlerini iptal etmiş (KVKK/Compliance).' };
    }

    const salutation = lead.name ? `Sayın ${lead.name}` : 'Değerli Müşterimiz';

    // 1. SMS Gönder (NetGSM)
    if (lead.phone) {
      await sendSms(lead.phone, `${salutation}, Teknikel servis randevunuz planlanmıştır. Detaylar için iletişime geçebilirsiniz.`);
    }

    // 2. Email Gönder (Resend)
    if (lead.email) {
      await sendOutreachEmail({ 
        id: lead.id, 
        email: lead.email, 
        name: lead.name 
      });
    }

    // 3. Status Güncelle (PROSPECT -> ACTIVE)
    await db.lead.update({
      where: { id: leadId },
      data: { 
        status: 'ACTIVE',
        lastInteractionDate: new Date()
      }
    });

    // 4. Log Kaydı
    await db.leadActivity.create({
      data: {
        leadId: leadId,
        type: 'CALL',
        description: `${salutation} için servis randevusu planlandı. İletişim kanalları tetiklendi.`,
        createdById: 'system',
        tenantId: lead.tenantId || 'teknikel'
      }
    });

    revalidatePath('/leads');
    return { success: true };
  } catch (error: any) {
    console.error('Schedule Call Error:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleCommunication(id: string) {
  try {
    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { success: false };

    await db.lead.update({
      where: { id },
      data: { communicationOptIn: !lead.communicationOptIn }
    });

    revalidatePath('/leads');
    return { success: true, enabled: !lead.communicationOptIn };
  } catch (error) {
    return { success: false };
  }
}

export async function calculateLeadScore(id: string) {
  try {
    const lead = await db.lead.findUnique({ 
      where: { id },
      include: { interactionSummaries: true }
    });
    
    if (!lead) return { success: false };

    let score = 0;
    const tags: string[] = [];

    // 1. Google Data Scoring
    if (lead.googleRating && lead.googleRating >= 4.5) {
      score += 30;
      tags.push("PRESTİJLİ PARTNER");
    }
    
    if (lead.userRatingsTotal && lead.userRatingsTotal > 50) {
      score += 20;
      tags.push("POPÜLER");
    }

    // 2. Interaction Scoring
    const interactionCount = lead.interactionSummaries.reduce((acc, curr) => acc + (curr.count ?? 0), 0);
    score += Math.min(interactionCount * 5, 40);

    // 3. Website/Contact Check
    if (lead.website) score += 10;

    await db.lead.update({
      where: { id },
      data: { 
        score: Math.min(score, 100),
        tags: tags
      }
    });

    revalidatePath('/leads');
    return { success: true, score: Math.min(score, 100) };
  } catch (error) {
    return { success: false };
  }
}

export async function checkChurnStatus(id: string) {
  try {
    const lead = await db.lead.findUnique({
      where: { id },
      include: { interactionSummaries: { orderBy: { lastSeen: 'desc' }, take: 1 } }
    });

    if (!lead || lead.interactionSummaries.length === 0) return { success: false };

    const lastSeen = new Date(lead.interactionSummaries[0].lastSeen);
    const now = new Date();
    const daysSinceLastInteraction = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastInteraction > 60) {
      // CHURN ALERT!
      if (lead.phone && lead.communicationOptIn) {
        await sendSms(lead.phone, `Teknikel: Sizi özledik! Bir sonraki kart tamirinizde %10 indirim kazandınız. Kod: OZLEDIK10`);
      }
      
      await db.lead.update({
        where: { id },
        data: { status: 'CHURN_ALARM' }
      });
      
      revalidatePath('/leads');
      return { churn: true, days: daysSinceLastInteraction };
    }

    return { churn: false };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteLead(id: string) {
  try {
    await db.lead.delete({
      where: { id }
    });
    revalidatePath('/leads');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleVipStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'VIP' ? 'PROSPECT' : 'VIP';
    await db.lead.update({
      where: { id },
      data: { status: newStatus }
    });
    revalidatePath('/leads');
    return { success: true, newStatus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
