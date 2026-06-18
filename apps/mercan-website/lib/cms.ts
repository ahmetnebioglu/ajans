import { prisma } from "@/lib/db";
export { prisma };

export async function getPageData(slug: string) {
  return await prisma.page.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });
}

export async function getSiteSettings() {
  return await prisma.siteSettings.findFirst();
}

export async function getAllPages() {
  return await prisma.page.findMany({
    select: { title: true, slug: true },
    orderBy: { createdAt: "asc" }
  });
}

