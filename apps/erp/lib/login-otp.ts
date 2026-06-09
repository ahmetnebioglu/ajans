import { unsecured_prisma as prisma } from "@ajans/db";
import { Resend } from "resend";

/** Geçici sabit kod — gerçek e-posta OTP’si devreye alınana kadar */
export const DEV_LOGIN_CODE = "111111";
const OTP_TTL_MINUTES = 10;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Sabit OTP (env veya dev) kullanılıyorsa DB'ye yazılmaz — token alanı global unique. */
function getFixedOtp(): string | null {
  const envCode = process.env.LOGIN_OTP_CODE?.trim();
  if (envCode) return envCode;
  if (process.env.NODE_ENV === "development") return DEV_LOGIN_CODE;
  return null;
}

export async function createLoginOtp(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const fixed = getFixedOtp();
  if (fixed) {
    return fixed;
  }

  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalized },
  });

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateOtp();
    try {
      await prisma.verificationToken.create({
        data: {
          identifier: normalized,
          token: code,
          expires,
        },
      });
      return code;
    } catch (err) {
      const isUniqueViolation =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002";
      if (!isUniqueViolation || attempt === 4) throw err;
    }
  }

  throw new Error("Doğrulama kodu oluşturulamadı.");
}

export async function verifyLoginOtp(
  email: string,
  code: string,
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const trimmed = code.trim();
  const fixed = getFixedOtp();

  if (fixed && trimmed === fixed) {
    return true;
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: normalized,
      token: trimmed,
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return false;
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalized },
  });

  return true;
}

export async function sendLoginOtpEmail(
  email: string,
  code: string,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[login-otp] RESEND_API_KEY yok — ${email} için kod: ${code}`);
    return { sent: false, error: "RESEND_API_KEY eksik" };
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "ERP <onboarding@resend.dev>";

  const response = await resend.emails.send({
    from,
    to: [email],
    subject: "ERP — Giriş doğrulama kodu",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0f172a;">ERP</h1>
        <p style="color: #475569; font-size: 14px;">Giriş için doğrulama kodunuz:</p>
        <p style="font-size: 32px; font-weight: 800; letter-spacing: 0.3em; color: #0d9488; margin: 24px 0;">${code}</p>
        <p style="color: #94a3b8; font-size: 12px;">Bu kod ${OTP_TTL_MINUTES} dakika geçerlidir. Kodu kimseyle paylaşmayın.</p>
      </div>
    `,
    text: `ERP giriş kodunuz: ${code}\nKod ${OTP_TTL_MINUTES} dakika geçerlidir.`,
  });

  if (response.error) {
    console.error("[login-otp] E-posta hatası:", response.error);
    return { sent: false, error: response.error.message };
  }

  return { sent: true };
}

export async function findLoginUser(email: string) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
}
