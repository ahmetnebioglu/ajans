import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGoogleAuth } from "@ajans/google-api";
import { google } from "googleapis";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const auth = await getGoogleAuth();
    const drive = google.drive({ version: "v3", auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const res = await drive.files.list({
      q: folderId ? `'${folderId}' in parents and trashed=false` : "trashed=false",
      fields: "files(id, name, mimeType, thumbnailLink, size, webViewLink)",
      pageSize: 50,
    });

    return NextResponse.json({ success: true, files: res.data.files || [] });
  } catch (error) {
    console.error("Drive assets fetch error:", error);
    return NextResponse.json({ success: true, files: [] });
  }
}
