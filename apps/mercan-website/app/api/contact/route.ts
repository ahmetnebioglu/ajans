import { NextResponse } from "next/server";
import { prisma } from "@/lib/cms";
import { sendContactNotification } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, message, subject } = await req.json();
    
    // DB'ye kaydet
    const contact = await (prisma as any).contactMessage.create({
      data: { name, email, message, subject: subject || "Web Sitesi İletişim Formu" }
    });

    // Adminlere mail at
    await sendContactNotification({ name, email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}
