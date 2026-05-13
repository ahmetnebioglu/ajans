import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getBilsoftStokById } from '@/src/services/bilsoft';
import { NextResponse } from 'next/server';

/**
 * Bilsoft'ta SKU ile stok kartı var mı kontrol eder.
 * Fatura oluşturma öncesi stok kontrol için kullanılır.
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
    const { sku } = await request.json();

    if (!sku) {
      return NextResponse.json(
        { success: false, message: 'SKU is required' },
        { status: 400 }
      );
    }

    const stok = await getBilsoftStokById(sku);

    if (!stok) {
      return NextResponse.json({
        success: false,
        message: `Stok kartı bulunamadı: ${sku}`,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stok kartı bulundu',
      data: stok,
    });
  } catch (error) {
    console.error('[InvoiceCheckItem] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
