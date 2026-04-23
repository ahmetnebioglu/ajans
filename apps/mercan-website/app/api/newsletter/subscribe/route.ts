import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ajans/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "E-posta adresi gerekli." }, { status: 400 });
    }

    // Mevcut kaydı kontrol et
    const existing = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existing && existing.status === "ACTIVE") {
      return NextResponse.json({ success: false, error: "Bu e-posta zaten kayıtlı." }, { status: 400 });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.newsletter.upsert({
      where: { email },
      create: {
        email,
        verificationToken,
        status: "PENDING"
      },
      update: {
        verificationToken,
        status: "PENDING"
      }
    });

    // TODO: Send verification email via Resend or similar
    console.log(`[Newsletter] Verification link for ${email}: /api/newsletter/verify?token=${verificationToken}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter Error]:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
