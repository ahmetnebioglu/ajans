"use server";

import { prisma } from "@ajans/db";
import { revalidatePath } from "next/cache";

export async function getReferenceSectors() {
  return await prisma.referenceSector.findMany({
    orderBy: { order: "asc" }
  });
}

export async function upsertReferenceSector(data: any) {
  const { id, ...rest } = data;
  
  if (id) {
    await prisma.referenceSector.update({
      where: { id },
      data: rest
    });
  } else {
    await prisma.referenceSector.create({
      data: rest
    });
  }
  
  revalidatePath("/dashboard/referanslar");
  return { success: true };
}

export async function deleteReferenceSector(id: string) {
  await prisma.referenceSector.delete({
    where: { id }
  });
  revalidatePath("/dashboard/referanslar");
  return { success: true };
}
