import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSecuredPrisma } from '@ajans/db';

function verifyIyzicoSignature(payload: any, signature: string, secretKey: string): boolean {
  const hmac = crypto.createHmac('sha256', secretKey);
  const calculatedSignature = hmac
    .update(JSON.stringify(payload))
    .digest('hex');
  return calculatedSignature === signature;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `webhook-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  console.warn(`[${requestId}] 🚀 IYZICO WEBHOOK RECEIVED`);
  console.warn(`[${requestId}] Timestamp: ${new Date().toISOString()}`);

  try {
    const body = await request.json();

    if (!body || Object.keys(body).length === 0) {
      console.warn(`[${requestId}] ⚠️ EMPTY BODY - No data received!`);
      return NextResponse.json(
        {
          success: false,
          error: 'Empty request body',
          requestId,
        },
        { status: 400 }
      );
    }

    // Verify signature - DB'den oku, yoksa env'dan oku
    const signature = request.headers.get('x-iyzico-signature') || request.headers.get('x-signature');
    let secretKey = process.env.IYZICO_SECRET_KEY;

    console.warn(`[${requestId}] 🔐 Signature: ${signature ? 'Present' : 'Missing'}`);

    // DB'den secret key'i oku
    const db = getSecuredPrisma('teknikel');
    try {
      const settings = await db.siteSettings.findUnique({ where: { tenantId: 'teknikel' } });
      if (settings?.iyzicoSecretKey) {
        secretKey = settings.iyzicoSecretKey;
      }
    } catch (dbError) {
      console.warn(`[${requestId}] Could not fetch secret key from DB, using env:`, dbError);
    }

    if (signature && secretKey) {
      const isValid = verifyIyzicoSignature(body, signature, secretKey);
      console.warn(`[${requestId}] Signature Valid: ${isValid}`);

      if (!isValid) {
        console.error(`[${requestId}] ❌ INVALID SIGNATURE!`);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid signature',
            requestId,
          },
          { status: 401 }
        );
      }
    } else {
      console.warn(`[${requestId}] ⚠️ Signature validation skipped`);
    }

    // Extract webhook data
    const iyziEventType = body.iyziEventType || 'unknown';
    const orderReferenceCode = body.orderReferenceCode;
    const customerReferenceCode = body.customerReferenceCode;
    const subscriptionReferenceCode = body.subscriptionReferenceCode;
    const iyziReferenceCode = body.iyziReferenceCode;
    const iyziEventTime = body.iyziEventTime;

    // Determine status
    let status = 'unknown';
    if (iyziEventType.includes('success')) {
      status = 'success';
    } else if (iyziEventType.includes('failure')) {
      status = 'failure';
    }

    console.warn(`[${requestId}] 📊 Payment Data:`);
    console.warn(`[${requestId}]   Event: ${iyziEventType}`);
    console.warn(`[${requestId}]   Order: ${orderReferenceCode}`);
    console.warn(`[${requestId}]   Status: ${status}`);

    // Check for existing payment
    const existingPayment = await db.iyzicoPayment.findUnique({
      where: { orderReferenceCode },
    });
    console.warn(`[${requestId}] 🔍 Existing: ${!!existingPayment}`);

    const paymentData = {
      orderReferenceCode,
      customerReferenceCode,
      subscriptionReferenceCode,
      iyziReferenceCode,
      iyziEventType,
      iyziEventTime: BigInt(iyziEventTime),
      eventDate: new Date(iyziEventTime),
      status,
      rawWebhookData: body,
    };

    let paymentRecord;

    if (existingPayment) {
      console.warn(`[${requestId}] 🔄 Updating existing record`);

      const logEntry = {
        action: 'updated',
        previousStatus: existingPayment.status,
        newStatus: status,
        changes: {
          iyziEventType: {
            old: existingPayment.iyziEventType,
            new: iyziEventType,
          },
          status: {
            old: existingPayment.status,
            new: status,
          },
        },
        timestamp: new Date(),
        webhookData: body,
      };

      const currentLogs = Array.isArray(existingPayment.logs) ? existingPayment.logs : [];

      paymentRecord = await db.iyzicoPayment.update({
        where: { orderReferenceCode },
        data: {
          ...paymentData,
          logs: [...currentLogs, logEntry],
          updatedAt: new Date(),
        },
      });
      console.warn(`[${requestId}] ✅ Updated with log`);
    } else {
      console.warn(`[${requestId}] ➕ Creating new record`);

      const newPaymentData = {
        ...paymentData,
        logs: [
          {
            action: 'created',
            newStatus: status,
            timestamp: new Date(),
            webhookData: body,
          },
        ],
      };

      paymentRecord = await db.iyzicoPayment.create({
        data: newPaymentData,
      });
      console.warn(`[${requestId}] ✅ Created new record`);
    }

    console.warn(`[${requestId}] 💾 DB ID: ${paymentRecord.id}`);

    // Handle event type
    switch (iyziEventType) {
      case 'subscription.order.success':
        console.warn(`[${requestId}] ✅ Subscription Order Success`);
        await db.iyzicoPayment.update({
          where: { id: paymentRecord.id },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });
        break;

      case 'subscription.order.failure':
        console.error(`[${requestId}] ❌ Subscription Order Failed`);
        await db.iyzicoPayment.update({
          where: { id: paymentRecord.id },
          data: {
            errorHasError: true,
            errorMessage: 'Subscription order failed',
            errorAt: new Date(),
          },
        });
        break;

      case 'payment.success':
        console.warn(`[${requestId}] ✅ Payment Success`);
        await db.iyzicoPayment.update({
          where: { id: paymentRecord.id },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });
        break;

      case 'payment.failure':
        console.error(`[${requestId}] ❌ Payment Failed`);
        await db.iyzicoPayment.update({
          where: { id: paymentRecord.id },
          data: {
            errorHasError: true,
            errorMessage: 'Payment failed',
            errorAt: new Date(),
          },
        });
        break;

      case 'refund':
        console.warn(`[${requestId}] 🔙 Refund Processing`);
        const currentLogs = Array.isArray(paymentRecord.logs) ? paymentRecord.logs : [];
        await db.iyzicoPayment.update({
          where: { id: paymentRecord.id },
          data: {
            refund: {
              refundId: iyziReferenceCode,
              refundedAt: new Date(),
            },
            status: 'refunded',
            logs: [
              ...currentLogs,
              {
                action: 'refund',
                previousStatus: paymentRecord.status,
                newStatus: 'refunded',
                timestamp: new Date(),
                webhookData: body,
              },
            ],
          },
        });
        break;

      default:
        console.warn(`[${requestId}] ⚠️ Unknown event: ${iyziEventType}`);
    }

    const duration = Date.now() - startTime;
    console.warn(`[${requestId}] ✅ SUCCESS - Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed',
      requestId,
      iyziEventType,
      orderReferenceCode,
      status,
      processedAt: new Date().toISOString(),
      duration: `${duration}ms`,
    });
  } catch (error: any) {
    console.error(`[${requestId}] 💥 WEBHOOK ERROR`);
    console.error(`[${requestId}] Error: ${error.name} - ${error.message}`);
    console.error(`[${requestId}] Stack: ${error.stack}`);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
