"use server";

import { protectedAction } from "@ajans/core/server";
import { 
  createJobPosting as coreCreateJobPosting,
  getJobPostings as coreGetJobPostings,
  addCandidate as coreAddCandidate,
  updateCandidateStatus as coreUpdateCandidateStatus,
  requestLeave as coreRequestLeave,
  updateLeaveStatus as coreUpdateLeaveStatus,
  getHRSummary as coreGetHRSummary,
  getCandidates as coreGetCandidates,
  getLeaveRequests as coreGetLeaveRequests
} from "@ajans/hr-core";
import { revalidatePath } from "next/cache";
import { CandidateStatus, LeaveStatus } from "@ajans/db";

/**
 * HR_MANAGER veya ADMIN yetkisi kontrolü yapar.
 */
function checkHRAuth(role: string) {
  if (role !== "ADMIN" && role !== "HR_MANAGER") {
    throw new Error("Bu işlem için yetkiniz bulunmamaktadır.");
  }
}

export async function createJobPosting(data: { title: string; description: string }) {
  return protectedAction(async ({ tenantId, user, db }) => {
    checkHRAuth(user.role);
    const result = await coreCreateJobPosting({ ...data, tenantId });
    
    await db.auditLog.create({
      data: {
        action: "HR_JOB_POSTING_CREATED",
        details: `${data.title} isimli iş ilanı oluşturuldu.`,
        userId: user.id,
        tenantId,
      }
    });

    revalidatePath("/dashboard/hr");
    return result;
  });
}

export async function getJobPostings() {
  return protectedAction(async ({ tenantId }) => {
    return await coreGetJobPostings(tenantId);
  });
}

export async function addCandidate(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  appliedForId: string;
}) {
  return protectedAction(async ({ tenantId, user, db }) => {
    checkHRAuth(user.role);
    const result = await coreAddCandidate({ ...data, tenantId });
    
    await db.auditLog.create({
      data: {
        action: "HR_CANDIDATE_ADDED",
        details: `${data.firstName} ${data.lastName} isimli aday eklendi.`,
        userId: user.id,
        tenantId,
      }
    });

    revalidatePath("/dashboard/hr/recruitment");
    return result;
  });
}

export async function updateCandidateStatus(candidateId: string, newStatus: CandidateStatus) {
  return protectedAction(async ({ tenantId, user, db }) => {
    checkHRAuth(user.role);
    const result = await coreUpdateCandidateStatus(candidateId, newStatus);
    
    await db.auditLog.create({
      data: {
        action: "HR_CANDIDATE_STATUS_CHANGED",
        details: `Aday durumu ${newStatus} olarak güncellendi.`,
        userId: user.id,
        tenantId,
      }
    });

    revalidatePath("/dashboard/hr/recruitment");
    return result;
  });
}

export async function requestLeave(data: {
  startDate: Date;
  endDate: Date;
  type: any; // LeaveType
}) {
  return protectedAction(async ({ tenantId, user, db }) => {
    const result = await coreRequestLeave({ ...data, userId: user.id, tenantId });
    
    await db.auditLog.create({
      data: {
        action: "HR_LEAVE_REQUESTED",
        details: `Yeni izin talebi oluşturuldu.`,
        userId: user.id,
        tenantId,
      }
    });

    revalidatePath("/dashboard/hr/leaves");
    return result;
  });
}

export async function updateLeaveStatus(leaveId: string, newStatus: LeaveStatus) {
  return protectedAction(async ({ tenantId, user, db }) => {
    checkHRAuth(user.role);
    const result = await coreUpdateLeaveStatus(leaveId, newStatus);
    
    await db.auditLog.create({
      data: {
        action: "HR_LEAVE_STATUS_CHANGED",
        details: `İzin talebi durumu ${newStatus} olarak güncellendi.`,
        userId: user.id,
        tenantId,
      }
    });

    revalidatePath("/dashboard/hr/leaves");
    return result;
  });
}

export async function getHRSummary() {
  return protectedAction(async ({ tenantId }) => {
    return await coreGetHRSummary(tenantId);
  });
}

export async function getCandidates(jobPostingId?: string) {
  return protectedAction(async ({ tenantId }) => {
    return await coreGetCandidates(tenantId, jobPostingId);
  });
}

export async function getLeaveRequests() {
  return protectedAction(async ({ tenantId }) => {
    return await coreGetLeaveRequests(tenantId);
  });
}
