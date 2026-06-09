import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getIdeasoftAbandonedCarts } from '@/src/services/ideasoft';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ideasoft/terk-edilen-sepetler
 * IdeaSoft terk edilmiş sepetlerini listeler
 * Query params: sort, limit, page
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

    const result = await getIdeasoftAbandonedCarts(sort, page, limit);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[IdeaSoft Abandoned Carts API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch abandoned carts',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
