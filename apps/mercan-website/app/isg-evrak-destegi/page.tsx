// Force reload Prisma client
import React from "react";
import { prisma } from "@/lib/db";
import IsgLibraryClient from "./IsgLibraryClient";

export const revalidate = 60; // ISR cache for fast loading

export default async function DocumentLibraryPage() {
  // Veritabanından sadece 'Yayında' (isPublished: true) olan belgeleri çekiyoruz
  const documents = await prisma.isgDocument.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });

  return <IsgLibraryClient documents={documents} />;
}

