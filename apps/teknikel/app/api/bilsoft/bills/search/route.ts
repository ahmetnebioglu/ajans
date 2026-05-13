import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { searchBilsoftFatura } from '@/src/services/bilsoft';
import { NextResponse } from 'next/server';

/**
 * Bilsoft'ta fatura arar (duplicate kontrol için).
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
    const payload = await request.json();

    const result = await searchBilsoftFatura(payload);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[BillsSearch] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
