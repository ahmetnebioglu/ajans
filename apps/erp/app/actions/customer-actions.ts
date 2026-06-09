"use server";

import { cookies } from "next/headers";
import { unsecured_prisma as prisma } from "@ajans/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function setActiveCompany(workspaceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Verify the user actually has access to this company
  const access = await prisma.workspaceUser.findFirst({
    where: {
      userId: (session.user as any).id,
      workspaceId: workspaceId
    }
  });

  if (!access && (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No access to this company" };
  }

  (await cookies()).set("active_workspace_id", workspaceId, {
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
    const all = await prisma.workspace.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, data: all };
  }

  const access = await prisma.workspaceUser.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { workspace: { name: "asc" } }
  });

  return { success: true, data: access.map(a => a.workspace) };
}

export async function updateCompanyDetails(workspaceId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Basic permission check
  const access = await prisma.workspaceUser.findFirst({
    where: { userId: (session.user as any).id, workspaceId }
  });

  if (!access && (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No access" };
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
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
