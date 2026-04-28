import { NextRequest, NextResponse } from 'next/server';
import { google } from "googleapis";
import { getGoogleAuth } from "@ajans/google-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return new NextResponse('Missing ID parameter', { status: 400 });

  try {
    const auth = getGoogleAuth();
    // Service Account veya OAuth2 desteği için istemciyi al
    const authClient = "getClient" in auth ? await (auth as any).getClient() : auth;
    const drive = google.drive({ version: "v3", auth: authClient });

    // Google Drive'dan dosyanın 'media' (içerik) stream'ini çek
    const response = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'stream' }
    );

    // Stream'i Next.js response'una dönüştür
    return new NextResponse(response.data as any, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Tarayıcı 1 gün önbellekte tutsun
      },
    });
  } catch (error: any) {
    console.error('[DriveProxy] Fetch Error:', error?.message);
    return new NextResponse('Image not found or access denied', { status: 404 });
  }
}
