import { NextResponse } from "next/server";
import {
  createLoginOtp,
  findLoginUser,
  sendLoginOtpEmail,
} from "@/lib/login-otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (!email.endsWith("@mercan.test")) {
      const user = await findLoginUser(email);
      if (!user) {
        return NextResponse.json(
          { error: "Bu e-posta adresi sistemde kayıtlı değil." },
          { status: 404 }
        );
      }
    }

    const code = await createLoginOtp(email);
    const { sent, error } = await sendLoginOtpEmail(email, code);

    return NextResponse.json({
      success: true,
      message: sent
        ? "Doğrulama kodu e-postanıza gönderildi."
        : "Doğrulama kodu oluşturuldu. (E-posta yapılandırması eksik — geliştirme kodunu kullanın.)",
      emailSent: sent,
      ...(process.env.NODE_ENV === "development" && !sent
        ? { devHint: "Geliştirme ortamında 111111 kodunu kullanabilirsiniz." }
        : {}),
      ...(error && process.env.NODE_ENV === "development"
        ? { mailError: error }
        : {}),
    });
  } catch (err) {
    console.error("[send-code]", err);
    return NextResponse.json(
      { error: "Kod gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
