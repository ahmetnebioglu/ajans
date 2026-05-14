import { NextRequest, NextResponse } from 'next/server';
import { getSecuredPrisma } from '@ajans/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getSecuredPrisma("teknikel");
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID zorunludur.' }, { status: 400 });
    }

    // Lead'in etkileşimlerini çek
    const interactions = await db.interaction.findMany({
      where: { leadId: id },
      orderBy: { lastSeen: 'desc' }
    });

    // Lead bilgilerini de çekelim (Score vb. için)
    const lead = await db.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        lead,
        interactions
      }
    });

  } catch (error: any) {
    console.error('[API LEAD INTERACTIONS ERROR]:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
