import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@ajans/core";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = ((session?.user as any)?.role || "").toUpperCase();
    if (!session || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get tenantId from session
    const tenantId = (session?.user as any)?.tenantId || "mercan";

    // Upload to S3/R2
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      tenantId,
      "cms"
    );

    return NextResponse.json({ 
      success: true, 
      fileId: result.key, 
      webViewLink: result.url 
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
