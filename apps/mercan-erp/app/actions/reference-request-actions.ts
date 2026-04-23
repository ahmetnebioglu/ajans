"use server";

import { prisma } from "@ajans/db";
import { revalidatePath } from "next/cache";

export async function getReferenceRequests() {
  return await prisma.referenceRequest.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function toggleReadStatus(id: string, currentStatus: boolean) {
  await prisma.referenceRequest.update({
    where: { id },
    data: { isRead: !currentStatus }
  });
  revalidatePath("/dashboard/referans-talepleri");
  return { success: true };
}

export async function deleteReferenceRequest(id: string) {
  await prisma.referenceRequest.delete({
    where: { id }
  });
  revalidatePath("/dashboard/referans-talepleri");
  return { success: true };
}
