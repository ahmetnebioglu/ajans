"use server";

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";

export async function getServices() {
  try {
    return await db.service.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Hizmetler alınamadı.");
  }
}

export async function getService(id: string) {
  try {
    return await db.service.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    throw new Error("Hizmet alınamadı.");
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    return await db.service.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }
}

export async function createService(data: {
  title: string;
  slug: string;
  featuredImage?: string | null;
  summary?: string | null;
  content: string;
  order: number;
  isPublished: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}) {
  try {
    const service = await db.service.create({
      data,
    });
    revalidatePath("/dashboard/cms/services");
    revalidatePath(`/hizmetlerimiz/${data.slug}`);
    return { success: true, data: service };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message || "Hizmet oluşturulamadı." };
  }
}

export async function updateService(
  id: string,
  data: {
    title: string;
    slug: string;
    featuredImage?: string | null;
    summary?: string | null;
    content: string;
    order: number;
    isPublished: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
  }
) {
  try {
    const service = await db.service.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/cms/services");
    revalidatePath(`/hizmetlerimiz/${data.slug}`);
    return { success: true, data: service };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return { success: false, error: error.message || "Hizmet güncellenemedi." };
  }
}

export async function deleteService(id: string) {
  try {
    const service = await db.service.delete({
      where: { id },
    });
    revalidatePath("/dashboard/cms/services");
    revalidatePath(`/hizmetlerimiz/${service.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return { success: false, error: error.message || "Hizmet silinemedi." };
  }
}
