"use server";

import { revalidatePath } from "next/cache";
import { protectedAction } from "@ajans/core/server";

export async function getBlogPosts() {
  return protectedAction(async ({ db }) => {
    return await db.blogPost.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function getBlogCategories() {
  return protectedAction(async ({ db }) => {
    return await db.blogCategory.findMany();
  });
}

export async function createBlogPost(data: any) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
    
    const post = await db.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        isPublished: data.isPublished,
        categoryId: data.categoryId,
      },
    });
    revalidatePath("/dashboard/cms/blog");
    return post;
  });
}

export async function updateBlogPost(id: string, data: any) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
    
    const post = await db.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        isPublished: data.isPublished,
        categoryId: data.categoryId,
      },
    });
    revalidatePath("/dashboard/cms/blog");
    return post;
  });
}

export async function deleteBlogPost(id: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
    
    await db.blogPost.delete({ where: { id } });
    revalidatePath("/dashboard/cms/blog");
    return { success: true };
  });
}

