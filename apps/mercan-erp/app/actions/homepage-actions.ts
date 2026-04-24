"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";

// --- WEBSITE REVALIDATION HELPER ---
async function triggerWebsiteRevalidate(path: string) {
  try {
    const websiteUrl = process.env.WEBSITE_URL || "http://localhost:3005";
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

export async function getHomepageSettings() {
  try {
    const settings = await (db as any).homepageSettings.findUnique({
      where: { id: 1 },
    });
    return settings;
  } catch (error) {
    console.error("Failed to fetch homepage settings:", error);
    return null;
  }
}

export async function updateHomepageSettings(data: any) {
  try {
    const session = await getServerSession(authOptions);
    console.log("DEBUG: Homepage Update Session:", JSON.stringify(session?.user));

    if (!session?.user?.email) {
      throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
    }

    // Oturumdaki veriye güvenmek yerine doğrudan DB'den kullanıcı rolünü kontrol edelim
    const user = await (db as any).user.findUnique({
      where: { email: session.user.email },
      select: { role: true, name: true }
    });
    
    console.log("DEBUG: DB User Found:", JSON.stringify(user));

    const userRole = user?.role?.toUpperCase();
    console.log("DEBUG: Processed Role:", userRole);
    
    if (!user || (userRole !== "ADMIN" && userRole !== "EXPERT")) {
      throw new Error(`Yetkisiz erişim: Mevcut rolünüz (${userRole || 'BELİRSİZ'}) bu işlem için yeterli değil.`);
    }

    const settings = await (db as any).homepageSettings.update({
      where: { id: 1 },
      data: {
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroButtonText: data.heroButtonText,
        heroImages: data.heroImages,
        katipProcess: data.katipProcess,
        naceBannerTitle: data.naceBannerTitle,
        naceBannerSubtitle: data.naceBannerSubtitle,
        mapUrl: data.mapUrl,
        aboutTitle: data.aboutTitle,
        aboutContent: data.aboutContent,
        aboutImage: data.aboutImage,
      },
    });

    revalidatePath("/");
    await triggerWebsiteRevalidate("/");
    return { success: true, settings };
  } catch (error: any) {
    console.error("Failed to update homepage settings:", error);
    return { success: false, error: error.message };
  }
}

