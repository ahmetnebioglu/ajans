import { NextResponse } from "next/server";
import { unsecured_prisma as prisma } from "@ajans/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/register
 * Yeni kullanıcı kaydı. Workspace oluşturma işlemi onboarding adımında yapılır.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validasyon
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Ad, e-posta ve şifre alanları zorunludur." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // E-posta kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı." },
        { status: 409 }
      );
    }

    // SQL Transaction içinde kullanıcı oluşturma
    const user = await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          role: "USER",
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        message: "Hesap başarıyla oluşturuldu.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register API Error]:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
