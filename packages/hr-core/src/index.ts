import { unsecured_prisma as db, JobStatus, CandidateStatus, LeaveType, LeaveStatus } from "@ajans/db";

/**
 * Yeni bir iş ilanı oluşturur.
 * SQL Transaction kullanılarak güvenli bir şekilde oluşturulur.
 */
export async function createJobPosting(data: {
  title: string;
  description: string;
  tenantId: string;
}) {
  return await db.$transaction(async (tx) => {
    return await tx.jobPosting.create({
      data: {
        title: data.title,
        description: data.description,
        tenantId: data.tenantId,
        status: JobStatus.DRAFT,
      },
    });
  });
}

/**
 * Belirli bir tenant için iş ilanlarını getirir.
 */
export async function getJobPostings(tenantId: string) {
  return await db.jobPosting.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: { candidates: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Belirli bir iş ilanı için adayları getirir.
 */
export async function getCandidates(tenantId: string, jobPostingId?: string) {
  return await db.candidate.findMany({
    where: { 
      tenantId,
      ...(jobPostingId ? { appliedForId: jobPostingId } : {}),
    },
    include: {
      jobPosting: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Yeni bir aday başvurusu ekler.
 * SQL Transaction kullanılarak güvenli bir şekilde oluşturulur.
 */
export async function addCandidate(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  appliedForId: string;
  tenantId: string;
}) {
  return await db.$transaction(async (tx) => {
    return await tx.candidate.create({
      data: {
        ...data,
        status: CandidateStatus.NEW,
      },
    });
  });
}

/**
 * Aday durumunu günceller.
 * SQL Transaction kullanılarak güvenli bir şekilde güncellenir.
 */
export async function updateCandidateStatus(candidateId: string, newStatus: CandidateStatus) {
  return await db.$transaction(async (tx) => {
    return await tx.candidate.update({
      where: { id: candidateId },
      data: { status: newStatus },
    });
  });
}

/**
 * İzin talebi oluşturur.
 * SQL Transaction kullanılarak güvenli bir şekilde oluşturulur.
 */
export async function requestLeave(data: {
  userId: string;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  tenantId: string;
}) {
  return await db.$transaction(async (tx) => {
    return await tx.leaveRequest.create({
      data: {
        ...data,
        status: LeaveStatus.PENDING,
      },
    });
  });
}

/**
 * İzin talebi durumunu günceller.
 * SQL Transaction kullanılarak güvenli bir şekilde güncellenir.
 */
export async function updateLeaveStatus(leaveId: string, newStatus: LeaveStatus) {
  return await db.$transaction(async (tx) => {
    return await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status: newStatus },
    });
  });
}

/**
 * Tüm izin taleplerini getirir (Admin/HR için).
 */
export async function getLeaveRequests(tenantId: string) {
  return await db.leaveRequest.findMany({
    where: { tenantId },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Belirli bir kullanıcının izin taleplerini getirir.
 */
export async function getUserLeaveRequests(userId: string) {
  return await db.leaveRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * HR Dashboard özet verilerini getirir.
 */
export async function getHRSummary(tenantId: string) {
  const [activeJobs, pendingCandidates, pendingLeaves] = await Promise.all([
    db.jobPosting.count({
      where: { tenantId, status: JobStatus.ACTIVE },
    }),
    db.candidate.count({
      where: { tenantId, status: CandidateStatus.NEW },
    }),
    db.leaveRequest.count({
      where: { tenantId, status: LeaveStatus.PENDING },
    }),
  ]);

  return {
    activeJobs,
    pendingCandidates,
    pendingLeaves,
  };
}
