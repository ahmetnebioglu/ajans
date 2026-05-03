import { NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isVipOnly = searchParams.get('vip') === 'true';

    const leads = await db.lead.findMany({
      where: {
        tenantId: 'teknikel',
        ...(isVipOnly ? {
          OR: [
            { score: { gte: 30 } },
            { status: 'VIP' }
          ]
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error: any) {
    console.error('[API LEADS GET ERROR]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
