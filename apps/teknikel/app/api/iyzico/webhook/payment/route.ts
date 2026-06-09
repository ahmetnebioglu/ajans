import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import IyzicoPayment from '@/lib/models/IyzicoPayment';

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

    // Verify signature
    const signature = request.headers.get('x-iyzico-signature') || request.headers.get('x-signature');
    const secretKey = process.env.IYZICO_SECRET_KEY;

    console.warn(`[${requestId}] 🔐 Signature: ${signature ? 'Present' : 'Missing'}`);

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

    // Connect to DB
    await dbConnect();
    console.warn(`[${requestId}] ✅ DB Connected`);

    // Check for existing payment
    const existingPayment = await IyzicoPayment.findOne({
      orderReferenceCode: orderReferenceCode,
    } as any);
    console.warn(`[${requestId}] 🔍 Existing: ${!!existingPayment}`);

    const paymentData = {
      orderReferenceCode,
      customerReferenceCode,
      subscriptionReferenceCode,
      iyziReferenceCode,
      iyziEventType,
      iyziEventTime,
      eventDate: new Date(iyziEventTime),
      status,
      rawWebhookData: body,
    };

    let paymentRecord;

    if (existingPayment) {
      console.warn(`[${requestId}] 🔄 Updating existing record`);

      const logEntry = {
        action: 'updated' as const,
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

      existingPayment.logs.push(logEntry);
      Object.assign(existingPayment, paymentData);
      existingPayment.updatedAt = new Date();

      paymentRecord = await existingPayment.save();
      console.warn(`[${requestId}] ✅ Updated with log`);
    } else {
      console.warn(`[${requestId}] ➕ Creating new record`);

      const newPaymentData = {
        ...paymentData,
        logs: [
          {
            action: 'created' as const,
            newStatus: status,
            timestamp: new Date(),
            webhookData: body,
          },
        ],
      };

      paymentRecord = await IyzicoPayment.create(newPaymentData);
      console.warn(`[${requestId}] ✅ Created new record`);
    }

    console.warn(`[${requestId}] 💾 DB ID: ${paymentRecord._id}`);

    // Handle event type
    switch (iyziEventType) {
      case 'subscription.order.success':
        console.warn(`[${requestId}] ✅ Subscription Order Success`);
        paymentRecord.processed = true;
        paymentRecord.processedAt = new Date();
        await paymentRecord.save();
        break;

      case 'subscription.order.failure':
        console.error(`[${requestId}] ❌ Subscription Order Failed`);
        paymentRecord.error = {
          hasError: true,
          errorMessage: 'Subscription order failed',
          errorAt: new Date(),
        };
        await paymentRecord.save();
        break;

      case 'payment.success':
        console.warn(`[${requestId}] ✅ Payment Success`);
        paymentRecord.processed = true;
        paymentRecord.processedAt = new Date();
        await paymentRecord.save();
        break;

      case 'payment.failure':
        console.error(`[${requestId}] ❌ Payment Failed`);
        paymentRecord.error = {
          hasError: true,
          errorMessage: 'Payment failed',
          errorAt: new Date(),
        };
        await paymentRecord.save();
        break;

      case 'refund':
        console.warn(`[${requestId}] 🔙 Refund Processing`);
        paymentRecord.refund = {
          refundId: iyziReferenceCode,
          refundedAt: new Date(),
        };
        paymentRecord.status = 'refunded';
        paymentRecord.logs.push({
          action: 'refund' as const,
          previousStatus: paymentRecord.status,
          newStatus: 'refunded',
          timestamp: new Date(),
          webhookData: body,
        });
        await paymentRecord.save();
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
