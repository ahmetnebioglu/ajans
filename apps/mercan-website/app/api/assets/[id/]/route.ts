import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('Missing asset ID', { status: 400 });
  }

  // Google Drive thumbnail/content linki
  const googleDriveUrl = `https://lh3.googleusercontent.com/d/${id}`;

  try {
    const response = await fetch(googleDriveUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Drive');
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Drive Proxy Error:', error);
    return new NextResponse('Asset not found', { status: 404 });
  }
}
