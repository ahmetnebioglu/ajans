import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getSmsRecords } from '@/lib/sms';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ideasoft/sms/records
 * Filtreli SMS kayıt listesi döndürür
 * Query params: type, status, startDate, endDate
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { status: 'error', message: 'Bu işlem için yetkiniz bulunmamaktadır.' },
      { status: 401 }
    );
  }

  try {

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter: Record<string, any> = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const records = await getSmsRecords(filter);

    return NextResponse.json({
      status: 'success',
      count: records.length,
      data: records,
    });
  } catch (error: any) {
    console.error('[SMS Records API] Error fetching SMS records:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'SMS kayıtları alınırken bir hata oluştu.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
