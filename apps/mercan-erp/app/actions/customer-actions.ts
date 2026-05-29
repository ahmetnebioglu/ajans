"use server";

import { cookies } from "next/headers";
import { unsecured_prisma as prisma } from "@ajans/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function setActiveCompany(companyId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Verify the user actually has access to this company
  const access = await prisma.companyAccess.findFirst({
    where: {
      userId: (session.user as any).id,
      companyId: companyId
    }
  });

  if (!access && (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No access to this company" };
  }

  (await cookies()).set("active_company_id", companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  return { success: true };
}

export async function getCustomerCompanies() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role === "ADMIN") {
    const all = await prisma.company.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, data: all };
  }

  const access = await prisma.companyAccess.findMany({
    where: { userId },
    include: { company: true },
    orderBy: { company: { name: "asc" } }
  });

  return { success: true, data: access.map(a => a.company) };
}

export async function updateCompanyDetails(companyId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Basic permission check
  const access = await prisma.companyAccess.findFirst({
    where: { userId: (session.user as any).id, companyId }
  });

  if (!access && (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No access" };
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: data.name,
      taxNumber: data.taxNumber,
      taxOffice: data.taxOffice,
      address: data.address,
      phone: data.phone
    }
  });

  return { success: true, data: updated };
}
