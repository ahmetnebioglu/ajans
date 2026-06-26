import { NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';
import { getBilsoftCariler, getBilsoftFaturalar } from '@/src/services/bilsoft';

export async function GET() {
  try {
    const { data: allCariler } = await getBilsoftCariler("", 1, 100000);
    const { data: allFaturalar } = await getBilsoftFaturalar("", 1, 1000000);
    let processed = 0;
    
    for (const cari of allCariler) {
      const cariFaturalar = allFaturalar.filter(f => f.cariKod === cari.cariKod && cari.cariKod !== "" && cari.cariKod !== null);
      let lastInvoiceDate = null;
      
      if (cariFaturalar.length > 0) {
        cariFaturalar.sort((a, b) => new Date(b.fatTarih).getTime() - new Date(a.fatTarih).getTime());
        lastInvoiceDate = new Date(cariFaturalar[0].fatTarih);
      }
      
      await db.bilsoftCariCache.upsert({
        where: { cariId: cari.id },
        update: {
          cariKod: cari.cariKod,
          faturaUnvan: cari.faturaUnvan,
          yetkili: cari.yetkili,
          cep: cari.cep,
          tel: cari.tel,
          mail: cari.mail,
          grup: cari.grup,
          lastInvoiceDate: lastInvoiceDate,
          lastCheckedAt: new Date(),
        },
        create: {
          cariId: cari.id,
          cariKod: cari.cariKod,
          faturaUnvan: cari.faturaUnvan,
          yetkili: cari.yetkili,
          cep: cari.cep,
          tel: cari.tel,
          mail: cari.mail,
          grup: cari.grup,
          lastInvoiceDate: lastInvoiceDate,
          lastCheckedAt: new Date(),
        }
      });
      processed++;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
