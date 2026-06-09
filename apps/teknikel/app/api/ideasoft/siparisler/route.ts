import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getIdeasoftOrders, getIdeasoftFilteredOrders } from '@/src/services/ideasoft';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ideasoft/siparisler
 * IdeaSoft siparişlerini listeler
 * Query params: sort, limit, page, status, paymentProviderCode, paymentStatus
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || '-id';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const status = searchParams.get('status') || undefined;
    const paymentProviderCode = searchParams.get('paymentProviderCode') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;

    // Eğer ödeme filtresi varsa, server-side filtreleme yap
    if (paymentProviderCode || paymentStatus) {
      const result = await getIdeasoftFilteredOrders(
        sort,
        page,
        limit,
        paymentProviderCode,
        paymentStatus
      );
      return NextResponse.json(result);
    }

    // Aksi takdirde normal sorguyu yap
    const result = await getIdeasoftOrders(sort, page, limit, status);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[IdeaSoft Orders API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        message: error.message,
      },
      { status: 500 }
    );
  }
}


