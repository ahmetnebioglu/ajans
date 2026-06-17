import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getNetgsmSmsCredit } from '@/lib/netgsm';
import { NextResponse } from 'next/server';

// NetGSM toplam SMS paketi varsayılan boyutu
const TOTAL_SMS_ALLOCATION = 20_000;

const getDefaultDates = () => {
  const startDate = new Date('2024-11-01T00:00:00.000Z');
  const endDate = new Date('2025-11-01T00:00:00.000Z');
  const lastSentDate = new Date();
  lastSentDate.setDate(lastSentDate.getDate() - 3);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    lastSentDate: lastSentDate.toISOString(),
    lastRechargeDate: startDate.toISOString(),
  };
};

/**
 * GET /api/ideasoft/sms/credit
 * NetGSM SMS kredi bakiyesini ve paket bilgilerini döndürür
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { status: 'error', message: 'Bu işlem için yetkiniz bulunmamaktadır.' },
      { status: 401 }
    );
  }

  try {
    const result = await getNetgsmSmsCredit();

    if (!result.success) {
      return NextResponse.json(
        { status: 'error', message: result.message, error: result.error },
        { status: 500 }
      );
    }

    const remainingCredits = result.remainingCredits ?? 0;
    const usedCredits = TOTAL_SMS_ALLOCATION - remainingCredits;
    const creditPercentage = Math.round((remainingCredits / TOTAL_SMS_ALLOCATION) * 100);
    const dates = getDefaultDates();

    const creditInfo = {
      companyName: 'Teknikel A.Ş.',
      packageName: 'Kurumsal SMS Paketi',
      senderNames: [process.env.NETGSM_SENDER],
      accountStatus: 'active',
      remainingCredits,
      usedCredits,
      totalCredits: TOTAL_SMS_ALLOCATION,
      creditPercentage,
      lastRechargeDate: dates.lastRechargeDate,
      lastSentDate: dates.lastSentDate,
      startDate: dates.startDate,
      endDate: dates.endDate,
      lastRechargeAmount: TOTAL_SMS_ALLOCATION,
    };

    return NextResponse.json({ status: 'success', data: creditInfo });
  } catch (error: any) {
    console.error('[SMS Credit API] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'SMS kredi bilgisi alınamadı.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
