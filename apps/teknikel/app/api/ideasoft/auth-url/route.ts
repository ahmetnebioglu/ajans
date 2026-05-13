import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';

/**
 * GET /api/ideasoft/auth-url
 * IdeaSoft OAuth2 yetkilendirme URL'ini döner.
 * Kullanıcı bu URL'e giderek IdeaSoft panelinde uygulamayı yetkilendirir.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const domain = process.env.domain;
  const clientId = process.env.client_id;
  const state = process.env.apiState;
  const redirectUri = process.env.redirect_uri;

  if (!domain || !clientId || !state || !redirectUri) {
    return NextResponse.json(
      { error: 'IdeaSoft OAuth yapılandırması eksik. Lütfen .env dosyasını kontrol edin.' },
      { status: 500 }
    );
  }

  const authUrl = `${domain}/panel/auth?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}`;

  return NextResponse.json({
    url: authUrl,
    domain,
    state,
  });
}
