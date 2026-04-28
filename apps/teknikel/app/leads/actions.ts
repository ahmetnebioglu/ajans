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

    // 1. SMS Gönder (NetGSM)
    if (lead.phone) {
      await sendSms(lead.phone, `Merhaba ${lead.name || ''}, bugün sizi Teknikel Kombi'den Ahmet Bey arayacak.`);
    }

    // 2. Email Gönder (Resend) - Hatırlatma formatında
    if (lead.email) {
      // Outreach servisini burada hatırlatma için kullanıyoruz
      await sendOutreachEmail({ 
        id: lead.id, 
        email: lead.email, 
        name: lead.name 
      });
    }

    // 3. Status Güncelle
    await db.lead.update({
      where: { id: leadId },
      data: { status: 'CALL_SCHEDULED' }
    });

    // 4. Log Kaydı (LeadActivity)
    await db.leadActivity.create({
      data: {
        leadId: leadId,
        type: 'CALL',
        description: 'Bugün aranacak olarak işaretlendi. SMS ve Email fırlatıldı.',
        createdById: 'system', // Veya aktif user ID
        tenantId: lead.tenantId || 'teknikel'
      }
    });

    revalidatePath('/leads');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('Schedule Call Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteLead(id: string) {
  try {
    await db.lead.delete({
      where: { id }
    });
    
    revalidatePath('/leads');
    revalidatePath('/vip');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete Lead Error:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleVipStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'VIP' ? 'NEW' : 'VIP';
    
    await db.lead.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath('/leads');
    revalidatePath('/vip');
    revalidatePath('/');
    
    return { success: true, newStatus };
  } catch (error: any) {
    console.error('Toggle VIP Status Error:', error);
    return { success: false, error: error.message };
  }
}
