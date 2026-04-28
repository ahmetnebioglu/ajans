"use server";

import { getSecuredPrisma } from "@ajans/db";
import { revalidateTenantCache } from "./cache-actions";
import { protectedAction } from "./protected-action";

export interface LeadData {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Public: CRM Lead oluşturma.
 * Ziyaretçiler tarafından kullanılır, auth gerektirmez.
 */
export async function submitContactForm(
  data: LeadData,
  source: string,
  tenantId: string
) {
  try {
    const db = getSecuredPrisma(tenantId);
    const result = await db.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          message: data.message,
          source: source,
          status: 'NEW',
          tenantId: tenantId,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'SYSTEM_NOTE',
          description: `Müşteri ${source} üzerinden yeni bir form doldurdu.`,
          createdById: 'system-user-id',
          tenantId: tenantId,
        },
      });

      return lead;
    });

    revalidateTenantCache(tenantId, 'crm-leads');
    return { success: true, leadId: result.id };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Form gönderilirken bir hata oluştu." };
  }
}

/**
 * Protected: Lead durumunu günceller.
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: string,
  tenantId: string, // Bu parametre artık session'dan doğrulanacak
  userId?: string
) {
  return protectedAction(async ({ db, tenantId: sessionTenantId, user }) => {
    // Güvenlik: Parametre ile gelen tenantId, session ile uyuşmalı (veya session'dakini kullan)
    const effectiveTenantId = sessionTenantId;

    await db.$transaction(async (tx) => {
      await tx.lead.update({
        where: { id: leadId },
        data: { status: newStatus },
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          type: 'STATUS_CHANGE',
          description: `Lead durumu '${newStatus}' olarak güncellendi.`,
          createdById: userId || user.id,
          tenantId: effectiveTenantId,
        },
      });
    });

    revalidateTenantCache(effectiveTenantId, 'crm-leads');
    return true;
  });
}

/**
 * Protected: Lead listesini çeker.
 */
export async function getLeads(tenantId: string) {
  return protectedAction(async ({ db, tenantId: sessionTenantId }) => {
    const leads = await db.lead.findMany({
      where: { 
        tenantId: sessionTenantId,
        deletedAt: null
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return leads;
  });
}

/**
 * @deprecated Use getLeads(tenantId) instead
 */
export const getLeadsByTenant = getLeads;
