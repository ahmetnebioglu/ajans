"use server";
// Triggering reload to pick up new Prisma Client (local path) - 2026-04-22

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";
import { uploadToDrive } from "@ajans/google-api";

/**
 * GÜVENLİK KONTROLÜ
 */
async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session.user;
}

// --- WEBSITE REVALIDATION HELPER ---
async function triggerWebsiteRevalidate(path: string) {
  try {
    const websiteUrl = process.env.WEBSITE_URL || "http://localhost:3000";
    const secret = process.env.REVALIDATE_SECRET;
    
    if (!secret) {
      console.warn("REVALIDATE_SECRET is missing. Cannot revalidate website.");
      return;
    }

    const res = await fetch(`${websiteUrl}/api/revalidate?path=${path}&secret=${secret}`);
    if (!res.ok) {
      console.error(`Revalidation failed for path ${path}: ${res.statusText}`);
    }
  } catch (err) {
    console.error("Website revalidation fetch error:", err);
  }
}

// --- PAGE & SECTION ACTIONS ---

export async function getPages() {
  return await prisma.page.findMany({
    include: { _count: { select: { sections: true } } },
    orderBy: { updatedAt: "desc" }
  });
}

export async function createPage(title: string, slug: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const page = await prisma.page.create({
      data: { title, slug }
    });
    revalidatePath("/dashboard/cms");
    await triggerWebsiteRevalidate(`/${slug}`);
    return { success: true, page };
  } catch (error) {
    return { success: false, error: "Sayfa oluşturulamadı." };
  }
}

export async function deletePage(id: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) return { success: false, error: "Sayfa bulunamadı." };
    
    await prisma.page.delete({ where: { id } });
    revalidatePath("/dashboard/cms");
    await triggerWebsiteRevalidate(`/${page.slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Sayfa silinemedi." };
  }
}

// --- BLOG ACTIONS ---

export async function getBlogPosts() {
  return await prisma.blogPost.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createBlogPost(data: { title: string; slug: string; content: string; featuredImage?: string }) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const post = await prisma.blogPost.create({ data });
    revalidatePath("/dashboard/cms/blog");
    await triggerWebsiteRevalidate(`/blog/${data.slug}`);
    await triggerWebsiteRevalidate(`/blog`);
    return { success: true, post };
  } catch (error) {
    return { success: false, error: "Blog yazısı oluşturulamadı." };
  }
}

// --- SETTINGS ACTIONS ---

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { id: "global" } });
  }
  return settings;
}

export async function updateSiteSettings(data: any) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    await prisma.siteSettings.update({
      where: { id: "global" },
      data
    });
    revalidatePath("/dashboard/cms/settings");
    await triggerWebsiteRevalidate(`/`); // Revalidate home or layout
    return { success: true };
  } catch (error) {
    return { success: false, error: "Ayarlar güncellenemedi." };
  }
}

// --- SECTION ACTIONS ---

export async function getPageSections(pageId: string) {
  return await prisma.pageSection.findMany({
    where: { pageId },
    orderBy: { order: "asc" }
  });
}

export async function addSection(pageId: string, type: any, content: any) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const lastSection = await prisma.pageSection.findFirst({
      where: { pageId },
      orderBy: { order: "desc" }
    });

    const section = await prisma.pageSection.create({
      data: {
        pageId,
        type,
        content,
        order: (lastSection?.order || 0) + 1
      }
    });

    revalidatePath(`/dashboard/cms/pages/${pageId}`);
    
    // Website Revalidation
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page) {
       await triggerWebsiteRevalidate(`/${page.slug}`);
    }

    return { success: true, section };
  } catch (error) {
    return { success: false, error: "Bölüm eklenemedi." };
  }
}

export async function deleteSection(sectionId: string, pageId: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    await prisma.pageSection.delete({ where: { id: sectionId } });
    revalidatePath(`/dashboard/cms/pages/${pageId}`);
    
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (page) {
       await triggerWebsiteRevalidate(`/${page.slug}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Bölüm silinemedi." };
  }
}

export async function savePageSections(sections: any[]) {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Yetkisiz erişim" };

    await prisma.$transaction(
      sections.map(section => 
        prisma.pageSection.update({
          where: { id: section.id },
          data: {
            content: section.content,
            order: section.order || 0
          }
        })
      )
    );

    // Revalidate website content
    if (sections.length > 0) {
      const firstSection = await prisma.pageSection.findUnique({
        where: { id: sections[0].id },
        include: { page: true }
      });
      if (firstSection && firstSection.page) {
        await triggerWebsiteRevalidate(`/${firstSection.page.slug}`);
      }
    }

    return { success: true, message: "Değişiklikler kaydedildi ve web sitesi güncellendi." };
  } catch (error) {
    console.error("Save sections error:", error);
    return { success: false, error: "Bölümler kaydedilemedi." };
  }
}

// --- ISG DOCUMENT ACTIONS ---

export async function getIsgCategories() {
  return await prisma.isgCategory.findMany({
    orderBy: { order: "asc" }
  });
}

export async function createIsgCategory(name: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const category = await prisma.isgCategory.create({
      data: { name, slug }
    });
    revalidatePath("/dashboard/cms/isg-library");
    return { success: true, category };
  } catch (error) {
    return { success: false, error: "Kategori oluşturulamadı." };
  }
}

export async function deleteIsgCategory(id: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    await prisma.isgCategory.delete({ where: { id } });
    revalidatePath("/dashboard/cms/isg-library");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Kategori silinemedi. İçinde belgeler olabilir." };
  }
}

export async function getIsgDocuments() {
  return await prisma.isgDocument.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function addIsgDocument(data: { title: string; categoryId: string; driveFileId: string; fileType?: string; isPublished?: boolean }) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const doc = await prisma.isgDocument.create({ data });
    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return { success: true, doc: await prisma.isgDocument.findUnique({ where: { id: doc.id }, include: { category: true } }) };
  } catch (error) {
    return { success: false, error: "İSG Belgesi eklenemedi." };
  }
}

export async function deleteIsgDocument(id: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    await prisma.isgDocument.delete({ where: { id } });
    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "İSG Belgesi silinemedi." };
  }
}

export async function toggleIsgDocumentStatus(id: string, isPublished: boolean) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    await prisma.isgDocument.update({
      where: { id },
      data: { isPublished }
    });
    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "İSG Belgesi durumu güncellenemedi." };
  }
}

// --- NACE CODE ACTIONS ---

export async function getNaceCodes() {
  return await prisma.naceCode.findMany({
    orderBy: { code: "asc" }
  });
}

export async function addNaceCode(data: { code: string; description: string; dangerClass: string }) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const nace = await prisma.naceCode.create({ data });
    revalidatePath("/dashboard/cms/nace-codes");
    await triggerWebsiteRevalidate(`/tehlike-siniflari`);
    return { success: true, nace };
  } catch (error) {
    return { success: false, error: "NACE kodu eklenemedi." };
  }
}

export async function deleteNaceCode(id: string) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    await prisma.naceCode.delete({ where: { id } });
    revalidatePath("/dashboard/cms/nace-codes");
    await triggerWebsiteRevalidate(`/tehlike-siniflari`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "NACE kodu silinemedi." };
  }
}

export async function uploadIsgDocument(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return { success: false, error: "Yetkisiz." };

  try {
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const fileType = formData.get("fileType") as string;

    if (!file || !title || !categoryId) {
      return { success: false, error: "Eksik bilgi." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Google Drive'a yükle
    const driveFile = await uploadToDrive(
      buffer,
      file.name,
      file.type,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    if (!driveFile || !driveFile.id) {
      return { success: false, error: "Google Drive yükleme hatası." };
    }

    // Veritabanına kaydet
    const doc = await prisma.isgDocument.create({
      data: {
        title,
        categoryId,
        driveFileId: driveFile.id,
        fileType: fileType || file.name.split('.').pop()?.toUpperCase() || "PDF",
        isPublished: true
      },
      include: { category: true }
    });

    revalidatePath("/dashboard/cms/isg-library");
    await triggerWebsiteRevalidate(`/isg-evrak-destegi`);
    return { success: true, doc };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Dosya yüklenemedi." };
  }
}



