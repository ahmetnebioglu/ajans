import { NextRequest, NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const url = searchParams.get('url');

  if (!id || !url) {
    return NextResponse.json({ error: 'ID ve URL zorunludur.' }, { status: 400 });
  }

  try {
    // 1. CLICK etkileşimini artır
    await db.interaction.upsert({
      where: { id: 'temp-id-' + id + '-CLICK' },
      create: {
        id: 'temp-id-' + id + '-CLICK',
        leadId: id,
        type: 'CLICK',
        count: 1,
        lastSeen: new Date()
      },
      update: {
        count: { increment: 1 },
        lastSeen: new Date()
      }
    }).catch(async () => {
      const existing = await db.interaction.findFirst({
        where: { leadId: id, type: 'CLICK' }
      });
      if (existing) {
        await db.interaction.update({
          where: { id: existing.id },
          data: { count: { increment: 1 }, lastSeen: new Date() }
        });
      } else {
        await db.interaction.create({
          data: { leadId: id, type: 'CLICK', count: 1 }
        });
      }
    });

    // 2. Lead skorunu güncelle (+5)
    await db.lead.update({
      where: { id },
      data: { score: { increment: 5 } }
    });

    // 3. VIP Kontrolü
    const lead = await db.lead.findUnique({ 
      where: { id },
      include: { interactions: true }
    });
    
    if (lead) {
      const clickInteraction = lead.interactions.find(i => i.type === 'CLICK');
      if ((clickInteraction && clickInteraction.count >= 3) || lead.score >= 15) {
        await db.lead.update({
          where: { id },
          data: { status: 'VIP' }
        });
      }
    }

  } catch (error) {
    console.error('Link Tracking Error:', error);
  }

  return NextResponse.redirect(url);
}
