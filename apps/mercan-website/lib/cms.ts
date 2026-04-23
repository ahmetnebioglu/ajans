import { prisma } from "@ajans/db";
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
  return await prisma.siteSettings.findUnique({
    where: { id: "global" }
  });
}

export async function getAllPages() {
  return await prisma.page.findMany({
    select: { title: true, slug: true },
    orderBy: { createdAt: "asc" }
  });
}
