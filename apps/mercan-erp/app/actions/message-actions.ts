"use server";

import { prisma } from "@ajans/db";
import { revalidatePath } from "next/cache";

export async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Mesajlar çekilemedi:", error);
    return [];
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true }
    });
    revalidatePath("/dashboard/cms/messages");
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteMessage(id: string) {
  try {
    await prisma.contactMessage.delete({
      where: { id }
    });
    revalidatePath("/dashboard/cms/messages");
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
