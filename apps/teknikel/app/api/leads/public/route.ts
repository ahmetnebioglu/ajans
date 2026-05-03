import { NextRequest, NextResponse } from 'next/server';
import { unsecured_prisma as db } from '@ajans/db';

/**
 * Halka Açık Lead Kayıt API'si
 * Bu rota herhangi bir servis token'ı veya kimlik doğrulaması gerektirmez.
 * Sadece 'teknikel' projesi için lead kayıtlarını kabul eder.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, companyName, email, phone, message, source } = body;

    // Temel doğrulama
    if (!companyName && !name) {
      return NextResponse.json({ success: false, error: 'İsim veya firma adı zorunludur.' }, { status: 400 });
    }

    // Lead oluştur (Halka açık form olduğu için unsecured_prisma kullanıyoruz ama tenantId'yi 'teknikel' olarak zorunlu tutuyoruz)
    const newLead = await db.lead.create({
      data: {
        name: name || "Web Müşterisi",
        companyName: companyName,
        email: email,
        phone: phone,
        message: message,
        source: source || 'WEB_FORM',
        status: 'PROSPECT',
        tenantId: 'teknikel', // Güvenlik: Bu rota sadece bu tenant'a yazar
      }
    });

    // Etkileşim kaydı oluştur
    await db.interaction.create({
      data: {
        leadId: newLead.id,
        type: 'CREATED',
        scoreAdded: 0,
        description: 'Web sitesi üzerinden form dolduruldu.',
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: newLead.id,
      message: 'Kaydınız başarıyla alındı.' 
    });

  } catch (error: any) {
    console.error('[PUBLIC LEAD API ERROR]:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'İşlem sırasında bir hata oluştu.' 
    }, { status: 500 });
  }
}
