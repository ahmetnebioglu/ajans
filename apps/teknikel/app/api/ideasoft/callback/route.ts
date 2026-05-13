import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { unsecured_prisma as db } from '@ajans/db';

/**
 * POST /api/ideasoft/callback
 * IdeaSoft OAuth2 callback işleyicisi.
 * IdeaSoft'tan dönen `code` ve `state` parametreleriyle access_token + refresh_token alır,
 * veritabanına kaydeder.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, state, domain: callbackDomain } = body;

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Eksik parametreler: code ve state zorunludur.' },
        { status: 400 }
      );
    }

    // State doğrulaması (CSRF koruması)
    const expectedState = process.env.apiState;
    if (state !== expectedState) {
      return NextResponse.json(
        { error: 'Geçersiz state parametresi. Güvenlik ihlali olabilir.' },
        { status: 400 }
      );
    }

    const domain = process.env.domain;
    const clientId = process.env.client_id;
    const clientSecret = process.env.client_secret;
    const redirectUri = process.env.redirect_uri;

    if (!domain || !clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'IdeaSoft OAuth yapılandırması eksik.' },
        { status: 500 }
      );
    }

    // Authorization Code ile Access Token + Refresh Token al
    const tokenResponse = await fetch(`${domain}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[IdeaSoft Callback] Token alınamadı:', tokenResponse.status, errorData);
      return NextResponse.json(
        { error: 'IdeaSoft token alınamadı.', details: errorData },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'IdeaSoft yanıtında token bilgileri eksik.' },
        { status: 500 }
      );
    }

    // Token'ları veritabanına kaydet (upsert)
    const expiresAt = new Date(Date.now() + (expires_in || 86400) * 1000);

    await db.apiToken.upsert({
      where: { provider: 'ideasoft' },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
      create: {
        provider: 'ideasoft',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
    });

    console.log('[IdeaSoft Callback] Token başarıyla alındı ve kaydedildi.');

    return NextResponse.json({
      status: 'success',
      message: 'IdeaSoft yetkilendirmesi başarıyla tamamlandı.',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('[IdeaSoft Callback] Hata:', error);
    return NextResponse.json(
      { error: 'Token işlemi sırasında bir hata oluştu.', details: error.message },
      { status: 500 }
    );
  }
}
