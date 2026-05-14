import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { MongoClient } from 'mongodb';

/**
 * POST /api/dev/copy-tokens
 *
 * Canlı (production) MongoDB veritabanındaki Token koleksiyonundan
 * IdeaSoft ve Bilsoft tokenlarını local PostgreSQL veritabanına kopyalar.
 *
 * SADECE development ortamında çalışır.
 *
 * Gerekli .env.local değişkeni:
 *   PRODUCTION_DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
 *
 * NOT: İleride proje PostgreSQL'e taşındığında bu endpoint güncellenmeli.
 */
export async function POST() {
  // 1. Oturum kontrolü
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Canlı DB bağlantı string'i kontrolü
  const productionDbUrl = process.env.PRODUCTION_DATABASE_URL;
  if (!productionDbUrl) {
    return NextResponse.json(
      {
        error:
          'PRODUCTION_DATABASE_URL ortam değişkeni tanımlı değil. ' +
          '.env.local dosyasına canlı MongoDB bağlantı adresini ekleyin.',
      },
      { status: 500 }
    );
  }

  // 4. Local PostgreSQL için Prisma client
  const { unsecured_prisma: localDb } = await import('@ajans/db');

  // 5. Canlı MongoDB'ye bağlan (native driver)
  const mongoClient = new MongoClient(productionDbUrl);

  try {
    console.log('[DevCopyTokens] Canlı MongoDB\'ye bağlanılıyor...');
    await mongoClient.connect();

    // Veritabanı adını URL'den çıkar (son segment, query string öncesi)
    const dbName = productionDbUrl.split('/').pop()?.split('?')[0];
    if (!dbName) {
      return NextResponse.json(
        { error: 'MongoDB URL\'sinden veritabanı adı çıkarılamadı.' },
        { status: 500 }
      );
    }

    const db = mongoClient.db(dbName);
    const tokenCollection = db.collection('tokens');

    // 6. Token koleksiyonundaki ilk (ve genellikle tek) kaydı çek
    const mongoToken = await tokenCollection.findOne({});

    if (!mongoToken) {
      return NextResponse.json(
        { error: 'Canlı MongoDB\'de token kaydı bulunamadı.' },
        { status: 404 }
      );
    }

    console.log('[DevCopyTokens] Token kaydı bulundu, local DB\'ye kopyalanıyor...');

    const results: string[] = [];
    const now = new Date();
    // Varsayılan expiry: 1 saat sonra (IdeaSoft token süresi bilinmiyorsa)
    const defaultExpiry = new Date(now.getTime() + 60 * 60 * 1000);

    // 7a. IdeaSoft tokenını kopyala
    if (mongoToken.accessToken) {
      await localDb.apiToken.upsert({
        where: { provider: 'ideasoft' },
        update: {
          accessToken: mongoToken.accessToken,
          refreshToken: mongoToken.refreshToken ?? null,
          expiresAt: defaultExpiry,
        },
        create: {
          provider: 'ideasoft',
          accessToken: mongoToken.accessToken,
          refreshToken: mongoToken.refreshToken ?? null,
          expiresAt: defaultExpiry,
        },
      });
      results.push('ideasoft');
      console.log('[DevCopyTokens] IdeaSoft token kopyalandı.');
    }

    // 7b. Bilsoft tokenını kopyala
    if (mongoToken.bilsoftToken) {
      const bilsoftExpiry = mongoToken.bilsoftTokenExpiration
        ? new Date(mongoToken.bilsoftTokenExpiration)
        : defaultExpiry;

      await localDb.apiToken.upsert({
        where: { provider: 'bilsoft' },
        update: {
          accessToken: mongoToken.bilsoftToken,
          refreshToken: null,
          expiresAt: bilsoftExpiry,
        },
        create: {
          provider: 'bilsoft',
          accessToken: mongoToken.bilsoftToken,
          refreshToken: null,
          expiresAt: bilsoftExpiry,
        },
      });
      results.push('bilsoft');
      console.log('[DevCopyTokens] Bilsoft token kopyalandı.');
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error:
            'MongoDB\'de token kaydı bulundu ancak accessToken veya bilsoftToken alanları boş.',
        },
        { status: 404 }
      );
    }

    console.log('[DevCopyTokens] Kopyalama tamamlandı:', results);

    return NextResponse.json({
      success: true,
      message: `${results.length} token başarıyla canlıdan local'e kopyalandı.`,
      providers: results,
    });
  } catch (error: any) {
    console.error('[DevCopyTokens] Hata:', error);
    return NextResponse.json(
      {
        error: 'Token kopyalama sırasında hata oluştu: ' + error.message,
      },
      { status: 500 }
    );
  } finally {
    await mongoClient.close();
  }
}
