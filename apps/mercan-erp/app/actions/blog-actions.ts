"use server";

import { prisma as db } from "@ajans/db";
import { revalidatePath } from "next/cache";

export async function getBlogPosts() {
  return await db.blogPost.findMany({
    include: { categories: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBlogCategories() {
  return await db.blogCategory.findMany();
}

export async function createBlogPost(data: any) {
  const post = await db.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      isPublished: data.isPublished,
      categoryId: data.categoryId,
    },
  });
  revalidatePath("/dashboard/cms/blog");
  return post;
}

export async function updateBlogPost(id: string, data: any) {
  const post = await db.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      isPublished: data.isPublished,
      categoryId: data.categoryId,
    },
  });
  revalidatePath("/dashboard/cms/blog");
  return post;
}

export async function deleteBlogPost(id: string) {
  await db.blogPost.delete({ where: { id } });
  revalidatePath("/dashboard/cms/blog");
}
