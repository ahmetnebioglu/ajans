"use server";

import { revalidatePath } from "next/cache";
import { uploadFile } from "@ajans/core";
import { protectedAction } from "@ajans/core/server";

// --- WEBSITE REVALIDATION HELPER ---
async function triggerWebsiteRevalidate(path: string) {
  try {
    const websiteUrl = process.env.WEBSITE_URL || "http://localhost:3000";
    const secret = process.env.REVALIDATE_SECRET;

    if (!secret) {
      console.warn("REVALIDATE_SECRET is missing. Cannot revalidate website.");
      return;
    }

    const res = await fetch(
      `${websiteUrl}/api/revalidate?path=${path}&secret=${secret}`,
    );
    if (!res.ok) {
      console.error(`Revalidation failed for path ${path}: ${res.statusText}`);
    }
  } catch (err) {
    console.error("Website revalidation fetch error:", err);
  }
}

// --- PAGE & SECTION ACTIONS ---

export async function getPages() {
  return protectedAction(async ({ db }) => {
    return await db.page.findMany({
      include: { _count: { select: { sections: true } } },
      orderBy: { updatedAt: "desc" },
    });
  });
}

export async function createPage(title: string, slug: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const page = await db.page.create({
      data: { title, slug },
    });
    revalidatePath("/dashboard/cms");
    await triggerWebsiteRevalidate(`/${slug}`);
    return page;
  });
}

export async function deletePage(id: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const page = await db.page.findUnique({ where: { id } });
    if (!page) throw new Error("Sayfa bulunamadı.");

    await db.page.delete({ where: { id } });
    revalidatePath("/dashboard/cms");
    await triggerWebsiteRevalidate(`/${page.slug}`);
    return { success: true };
  });
}

// --- BLOG ACTIONS ---

export async function getBlogPosts() {
  return protectedAction(async ({ db }) => {
    return await db.blogPost.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function createBlogPost(data: {
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
}) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const post = await db.blogPost.create({ data });
    revalidatePath("/dashboard/cms/blog");
    await triggerWebsiteRevalidate(`/blog/${data.slug}`);
    await triggerWebsiteRevalidate(`/blog`);
    return post;
  });
}

// --- SETTINGS ACTIONS ---

export async function getSiteSettings() {
  return protectedAction(async ({ db, tenantId }) => {
    let settings = await db.siteSettings.findUnique({
      where: { tenantId },
    });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { tenantId } });
    }
    return settings;
  });
}

export async function updateSiteSettings(data: any) {
  return protectedAction(async ({ db, user, tenantId }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const { id, ...updateData } = data;

    await db.siteSettings.update({
      where: { tenantId },
      data: updateData,
    });
    revalidatePath("/dashboard/cms/settings");
    await triggerWebsiteRevalidate(`/`);
    return { success: true };
  });
}

// --- SECTION ACTIONS ---

export async function getPageSections(pageId: string) {
  return protectedAction(async ({ db }) => {
    return await db.pageSection.findMany({
      where: { pageId },
      orderBy: { order: "asc" },
    });
  });
}

export async function addSection(pageId: string, type: any, content: any) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const lastSection = await db.pageSection.findFirst({
      where: { pageId },
      orderBy: { order: "desc" },
    });

    const section = await db.pageSection.create({
      data: {
        pageId,
        type,
        content,
        order: (lastSection?.order || 0) + 1,
      },
    });

    revalidatePath(`/dashboard/cms/pages/${pageId}`);

    const page = await db.page.findUnique({ where: { id: pageId } });
    if (page) {
      await triggerWebsiteRevalidate(`/${page.slug}`);
    }

    return section;
  });
}

export async function deleteSection(sectionId: string, pageId: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    await db.pageSection.delete({ where: { id: sectionId } });
    revalidatePath(`/dashboard/cms/pages/${pageId}`);

    const page = await db.page.findUnique({ where: { id: pageId } });
    if (page) {
      await triggerWebsiteRevalidate(`/${page.slug}`);
    }

    return { success: true };
  });
}

export async function savePageSections(sections: any[]) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    await db.$transaction(
      sections.map((section) =>
        db.pageSection.update({
          where: { id: section.id },
          data: {
            content: section.content,
            order: section.order || 0,
          },
        }),
      ),
    );

    if (sections.length > 0) {
      const firstSection = await db.pageSection.findUnique({
        where: { id: sections[0].id },
        include: { page: true },
      });
      if (firstSection && firstSection.page) {
        await triggerWebsiteRevalidate(`/${firstSection.page.slug}`);
      }
    }

    return { message: "Değişiklikler kaydedildi ve web sitesi güncellendi." };
  });
}

// --- ISG DOCUMENT ACTIONS ---

export async function getIsgCategories() {
  return protectedAction(async ({ db }) => {
    return await db.isgCategory.findMany({
      orderBy: { order: "asc" },
    });
  });
}

export async function createIsgCategory(name: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await db.isgCategory.create({
      data: { name, slug },
    });
    revalidatePath("/dashboard/cms/isg-library");
    return category;
  });
}

export async function deleteIsgCategory(id: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    await db.isgCategory.delete({ where: { id } });
    revalidatePath("/dashboard/cms/isg-library");
    return { success: true };
  });
}

export async function getIsgDocuments() {
  return protectedAction(async ({ db }) => {
    return await db.isgDocument.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function addIsgDocument(data: {
  title: string;
  categoryId: string;
  s3Key: string;
  fileType?: string;
  isPublished?: boolean;
}) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const doc = await db.isgDocument.create({ data });
    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return await db.isgDocument.findUnique({
      where: { id: doc.id },
      include: { category: true },
    });
  });
}

export async function deleteIsgDocument(id: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    await db.isgDocument.delete({ where: { id } });
    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return { success: true };
  });
}

export async function toggleIsgDocumentStatus(
  id: string,
  isPublished: boolean,
) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    await db.isgDocument.update({
      where: { id },
      data: { isPublished },
    });
    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return { success: true };
  });
}

// --- NACE CODE ACTIONS ---

export async function getNaceCodes() {
  return protectedAction(async ({ db }) => {
    return await db.naceCode.findMany({
      orderBy: { code: "asc" },
    });
  });
}

export async function addNaceCode(data: {
  code: string;
  description: string;
  dangerClass: string;
}) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const nace = await db.naceCode.create({ data });
    revalidatePath("/dashboard/cms/nace-codes");
    await triggerWebsiteRevalidate(`/tehlike-siniflari`);
    return nace;
  });
}

export async function deleteNaceCode(id: string) {
  return protectedAction(async ({ db, user }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    await db.naceCode.delete({ where: { id } });
    revalidatePath("/dashboard/cms/nace-codes");
    await triggerWebsiteRevalidate(`/tehlike-siniflari`);
    return { success: true };
  });
}

export async function uploadIsgDocument(formData: FormData) {
  return protectedAction(async ({ db, user, tenantId }) => {
    if (user.role !== "ADMIN") throw new Error("UNAUTHORIZED");

    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const fileType = formData.get("fileType") as string;

    if (!file || !title || !categoryId) {
      throw new Error("Eksik bilgi.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const s3Resp = await uploadFile(
      buffer,
      file.name,
      file.type,
      tenantId || "mercan",
      "isg-documents"
    );

    const doc = await db.isgDocument.create({
      data: {
        title,
        categoryId,
        s3Key: s3Resp.key,
        fileType:
          fileType || file.name.split(".").pop()?.toUpperCase() || "PDF",
        isPublished: true,
      },
      include: { category: true },
    });

    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return doc;
  });
}
