import { unsecured_prisma as prisma } from "./client";

/**
 * API kullanımlarını veritabanına kaydeder.
 * Sistem performansını etkilememesi için asenkron çalışır ve hataları yutar.
 * 
 * @param service Servis adı (Örn: "GOOGLE_PLACES", "RESEND")
 * @param endpoint Endpoint adı (Örn: "AUTOCOMPLETE", "SEND_EMAIL")
 * @param cost Tahmini dolar maliyeti
 */
export async function logApiUsage(service: string, endpoint: string, cost: number) {
  try {
    // Await kullanıyoruz ancak çağıran yer genelde beklemez (fire-and-forget)
    await prisma.apiUsage.create({
      data: { service, endpoint, cost }
    });
  } catch (error) {
    // Logger çökse bile ana uygulamanın akışını bozmamalı
    console.error("API Usage Logger Failed:", error);
  }
}
