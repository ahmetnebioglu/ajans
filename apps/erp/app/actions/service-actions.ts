"use server";

import { revalidatePath } from "next/cache";
import { protectedAction } from "@ajans/core/server";

export async function getServices() {
  return protectedAction(async ({ db }) => {
    return await db.service.findMany({
      orderBy: { order: "asc" },
    });
  });
}

export async function getService(id: string) {
  return protectedAction(async ({ db }) => {
    return await db.service.findUnique({
      where: { id },
    });
  });
}

export async function getServiceBySlug(slug: string) {
  return protectedAction(async ({ db }) => {
    return await db.service.findUnique({
      where: { slug },
    });
  });
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
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
    
    const service = await db.service.create({
      data,
    });
    revalidatePath("/dashboard/cms/services");
    revalidatePath(`/hizmetlerimiz/${data.slug}`);
    return { success: true, data: service };
  });
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
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
    
    const service = await db.service.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/cms/services");
    revalidatePath(`/hizmetlerimiz/${data.slug}`);
    return { success: true, data: service };
  });
}

export async function deleteService(id: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
    
    const service = await db.service.delete({
      where: { id },
    });
    revalidatePath("/dashboard/cms/services");
    revalidatePath(`/hizmetlerimiz/${service.slug}`);
    return { success: true };
  });
}

