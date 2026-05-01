import { NextResponse } from "next/server";
import { unsecured_prisma as prisma } from "@ajans/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "admin@teknikel.com";
    const password = "teknikel2026";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("Admin zaten mevcut", { status: 200 });
    }

    // Admin kullanıcısını oluştur
    await prisma.user.create({
      data: {
        email,
        name: "Admin Teknikel",
        password: hashedPassword,
        role: "ADMIN", // Şemada ADMIN rolü olduğunu varsayıyoruz (options.ts'den görüldüğü üzere)
        tenantId: "mercan", // Varsayılan tenantId (options.ts'deki gibi)
      },
    });

    return new NextResponse("Admin oluşturuldu", { status: 201 });
  } catch (error: any) {
    console.error("Seed error:", error);
    return new NextResponse(`Hata oluştu: ${error.message}`, { status: 500 });
  }
}
