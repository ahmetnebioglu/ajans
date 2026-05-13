import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getBilsoftCariler, normalizeString } from '@/src/services/bilsoft';
import { NextResponse } from 'next/server';

/**
 * Bilsoft carilerinde müşteri adına göre ara.
 * Servis siparişleri için cari seçimi yapmak için kullanılır.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { customerName } = await request.json();

    if (!customerName) {
      return NextResponse.json(
        { success: false, message: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Bilsoft'tan carileri çek
    const { data: caris } = await getBilsoftCariler(customerName, 1, 100);

    if (!caris || caris.length === 0) {
      return NextResponse.json({
        success: true,
        caris: [],
        message: 'Cari bulunamadı',
      });
    }

    // Müşteri adıyla eşleştir
    const normalizedCustomerName = normalizeString(customerName);
    const matches = caris.filter((cari) => {
      const normalizedUnvan = normalizeString(cari.faturaUnvan);
      const normalizedYetkili = normalizeString(cari.yetkili);
      
      return (
        normalizedUnvan.includes(normalizedCustomerName) ||
        normalizedYetkili.includes(normalizedCustomerName)
      );
    });

    return NextResponse.json({
      success: true,
      caris: matches.length > 0 ? matches : caris.slice(0, 10),
      message: `${matches.length} cari bulundu`,
    });
  } catch (error) {
    console.error('[CariSearch] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
