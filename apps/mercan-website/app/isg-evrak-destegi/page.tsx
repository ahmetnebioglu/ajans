// Force reload Prisma client
import React from "react";
import { prisma } from "@/lib/db";
import IsgLibraryClient from "./IsgLibraryClient";
import { getFileUrl } from "@ajans/core";

export const revalidate = 60; // ISR cache for fast loading

export default async function DocumentLibraryPage() {
  // Veritabanından sadece 'Yayında' (isPublished: true) olan belgeleri çekiyoruz
  const rawDocuments = await prisma.isgDocument.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });

  const documents = rawDocuments.map(doc => {
    // Legacy seed docs start with "1Seed", map them to Drive links for demo purposes
    const fileUrl = (doc.s3Key.startsWith("1Seed") || doc.s3Key.startsWith("mock"))
      ? `https://drive.google.com/file/d/${doc.s3Key}/view?usp=sharing`
      : getFileUrl(doc.s3Key);

    return {
      id: doc.id,
      title: doc.title,
      fileUrl,
      fileType: doc.fileType || undefined,
      categoryId: doc.categoryId,
      category: {
        id: doc.category.id,
        name: doc.category.name,
      },
      createdAt: doc.createdAt,
    };
  });

  return <IsgLibraryClient documents={documents} />;
}

