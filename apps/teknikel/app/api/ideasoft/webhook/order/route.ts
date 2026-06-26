import { NextRequest, NextResponse } from 'next/server';
import { sendNetgsmBulkSms } from '@/lib/netgsm';
import { createSmsRecord, updateSmsRecord, getSmsRecords } from '@/lib/sms';

export async function POST(req: NextRequest) {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  try {
    const userAgent = req.headers.get('user-agent') || 'No user-agent header';
    
    // Yalnızca Ideasoft'tan gelen webhookları kabul et
    if (userAgent !== 'IDEASOFT-WEBHOOK') {
      return NextResponse.json({ status: 'error', message: 'Geçersiz User-Agent' }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error(`[${requestId}] Invalid JSON body`);
      return NextResponse.json({ status: 'error', message: 'Geçersiz JSON formatı' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      console.error(`[${requestId}] ❌ ERROR: Invalid webhook body format`);
      return NextResponse.json({ status: 'error', message: 'Geçersiz webhook formatı' }, { status: 400 });
    }

    // Olay tipini belirle (create veya update)
    const orderUpdate = body['order/update'] || null;
    const orderCreate = body['order/create'] || null;
    const orderInfo = orderUpdate || orderCreate || {};
    const eventType = orderUpdate ? 'update' : orderCreate ? 'create' : 'unknown';

    // ID ve diğer değerleri güvenli şekilde alalım
    const orderId = orderInfo.id || null;
    const status = orderInfo.status || null;
    const paymentProviderCode = orderInfo.paymentProviderCode || null;
    const paymentStatus = orderInfo.paymentStatus || null;

    if (
      orderId !== null &&
      ((status === 'approved' && paymentProviderCode === 'Iyzico') ||
        (paymentProviderCode === 'MoneyOrder' &&
          (status === 'waiting_for_approval' ||
            paymentStatus === 'in_transaction' ||
            paymentStatus === 'success')))
    ) {
      
      // Çevresel değişkenlerden telefon numaralarını al
      const ismailPhone = process.env.ismail;
      const gokhanPhone = process.env.gokhan;
      const ahmetPhone = process.env.ahmet;

      if (!ismailPhone && !gokhanPhone && !ahmetPhone) {
        console.error(`[${requestId}] No notification phone numbers configured`);
      } else {
        const receivers: string[] = [];
        if (ismailPhone) receivers.push(ismailPhone);
        if (gokhanPhone) receivers.push(gokhanPhone);
        if (ahmetPhone) receivers.push(ahmetPhone);

        const orderNumber = orderId || 'Bilinmiyor';
        const paymentProviderName = orderInfo?.paymentProviderName || 'Bilinmiyor';

        let finalAmount = 'Bilinmiyor';
        try {
          if (orderInfo?.finalAmount) {
            finalAmount = `${parseFloat(orderInfo.finalAmount)
              .toFixed(2)
              .replace('.', '#')
              .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
              .replace('#', ',')} TL`;
          }
        } catch (amountError: any) {
          console.error('Tutar formatlanırken hata:', amountError.message);
        }

        let customerName = 'Bilinmiyor';
        try {
          if (orderInfo?.customerFirstname) {
            customerName = `${orderInfo.customerFirstname} ${orderInfo.customerSurname || ''}`.trim();
          }
        } catch (nameError: any) {
          console.error('Müşteri adı formatlanırken hata:', nameError.message);
        }

        const message = `Yeni Sipariş: #${orderNumber}, \n${customerName},\n${paymentProviderName} ile\n${finalAmount} değerinde sipariş oluşturdu.\nSiparişi görmek için:\nhttps://teknikelkombi.myideasoft.com/panel/orders/edit/${orderNumber}`;

        if (receivers.length > 0) {
          try {
            // Son 5 dakika içinde aynı sipariş için atılmış mesaj var mı kontrolü
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            // getSmsRecords filtresi Prisma mantığı ile:
            const recentSms = await getSmsRecords({
              type: 'order',
              createdAt: { $gte: fiveMinutesAgo }
            });

            const isDuplicate = recentSms.some(sms => 
              sms.message.includes(`Yeni Sipariş: #${orderId}`) || sms.message === message
            );

            if (isDuplicate) {
              return NextResponse.json({
                status: 'success',
                message: 'Webhook alındı (duplicate)',
              });
            }

            const recipientsStr = receivers.join(', ');
            const smsRecord = await createSmsRecord({
              recipient: recipientsStr,
              message,
              type: 'order',
              orderId: orderId.toString(),
              orderEvent: eventType as any,
              orderInfo: {
                id: orderId,
                customerName,
                amount: finalAmount,
                paymentProvider: paymentProviderName,
              }
            });

            // SMS gönderimi
            const smsResult = await sendNetgsmBulkSms({
              receivers,
              message,
              type: 'order',
              saveToDb: false, // createSmsRecord ile yukarıda manuel oluşturduk
            });

            if (!smsResult.success) {
              console.error(`[${requestId}] SMS failed: ${smsResult.message} (Code: ${smsResult.responseCode})`);
              
              await updateSmsRecord(smsRecord.id, {
                responseCode: smsResult.responseCode || 'HATA',
                status: 'failed',
                errorDetail: smsResult.message || 'Bilinmeyen hata',
              });
            } else {
              await updateSmsRecord(smsRecord.id, {
                responseCode: smsResult.responseCode,
                messageId: smsResult.messageId || null,
                bulkId: smsResult.bulkId || null,
                jobId: (smsResult as any).jobId || null,
                status: 'sent',
              });
            }
          } catch (smsError: any) {
            console.error(`[${requestId}] SMS error: ${smsError.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Webhook alındı',
    });
  } catch (topLevelError: any) {
    console.error(`[${requestId}] Handler error: ${topLevelError.message}`);
    return NextResponse.json({
      status: 'error',
      message: 'Handler crashed',
      error: topLevelError.message,
    }, { status: 500 });
  }
}
