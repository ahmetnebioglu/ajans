import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@ajans/google-api";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";

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

    // Upload to Google Drive (folderId optional, uses default if not provided)
    const result = await uploadToDrive(
      buffer,
      file.name,
      file.type,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    return NextResponse.json({ 
      success: true, 
      fileId: result.id, 
      webViewLink: result.webViewLink 
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
