import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getSmsRecord } from '@/lib/sms';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ideasoft/sms/record/[id]
 * Tek bir SMS kaydını ID'ye göre döndürür
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { status: 'error', message: 'Bu işlem için yetkiniz bulunmamaktadır.' },
      { status: 401 }
    );
  }

  try {

    const record = await getSmsRecord(id);

    if (!record) {
      return NextResponse.json(
        { status: 'error', message: 'SMS kaydı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: record,
    });
  } catch (error: any) {
    console.error('[SMS Record API] Error fetching SMS record:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'SMS kaydı alınırken bir hata oluştu.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
