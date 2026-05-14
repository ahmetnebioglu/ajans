import { NextRequest, NextResponse } from 'next/server';
import { getSecuredPrisma } from '@ajans/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getSecuredPrisma("teknikel");
  const { id } = await params;

  try {
    // 1. Interaction kaydını güncelle veya oluştur
    const interaction = await db.interaction.upsert({
      where: {
        // Burada unique constraint olmadığı için type bazlı kontrol zor.
        // Ama leadId + type bazlı bir index eklemiş olmalıydık.
        // Şimdilik id bazlı değil, manuel kontrol yapalım.
        id: 'temp-id-' + id + '-OPEN'
      },
      create: {
        id: 'temp-id-' + id + '-OPEN',
        leadId: id,
        type: 'OPEN',
        count: 1,
        lastSeen: new Date()
      },
      update: {
        count: { increment: 1 },
        lastSeen: new Date()
      }
    }).catch(async () => {
      // Upsert fail olursa manuel
      const existing = await db.interaction.findFirst({
        where: { leadId: id, type: 'OPEN' }
      });
      if (existing) {
        await db.interaction.update({
          where: { id: existing.id },
          data: { count: { increment: 1 }, lastSeen: new Date() }
        });
      } else {
        await db.interaction.create({
          data: { leadId: id, type: 'OPEN', count: 1 }
        });
      }
    });

    // 2. Lead skorunu güncelle (+1)
    await db.lead.update({
      where: { id },
      data: { score: { increment: 1 } }
    });

    // VIP Logic (Stage 5) - Burada da kontrol edebiliriz ama Stage 5'te merkezi bir yer daha iyi olabilir.
    // Şimdilik skora göre hemen güncelleme yapalım.
    const updatedLead = await db.lead.findUnique({ where: { id } });
    if (updatedLead && updatedLead.score >= 15) {
      await db.lead.update({ where: { id }, data: { status: 'VIP' } });
    }

  } catch (error) {
    console.error('Pixel Tracking Error:', error);
  }

  // 1x1 transparent GIF
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
