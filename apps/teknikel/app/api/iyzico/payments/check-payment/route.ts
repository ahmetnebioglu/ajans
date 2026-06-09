import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for iyzipay (CommonJS module)
async function getIyzipay() {
  const Iyzipay = (await import('iyzipay')).default;
  return Iyzipay;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, transactionId } = await request.json();

    if (!orderId && !transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'orderId or transactionId required',
        },
        { status: 400 }
      );
    }

    const baseUrl = (process.env.IYZICO_BASE_URL || '').replace(/\/$/, '');
    const apiKey = process.env.IYZICO_API_KEY || '';
    const secretKey = process.env.IYZICO_SECRET_KEY || '';

    if (!baseUrl || !apiKey || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Iyzico configuration missing',
        },
        { status: 500 }
      );
    }

    const Iyzipay = await getIyzipay();

    const iyzipay = new Iyzipay({
      apiKey: apiKey,
      secretKey: secretKey,
      uri: baseUrl,
    });

    const retrievePayment = (opts: any) =>
      new Promise((resolve, reject) => {
        iyzipay.payment.retrieve(opts, (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    let lastError = null;

    // Try by paymentId (transactionId)
    if (transactionId) {
      try {
        const r = await retrievePayment({ paymentId: String(transactionId) });
        if (r && (String((r as any).status).toLowerCase() === 'success' || (r as any).status)) {
          return NextResponse.json({
            success: true,
            found: true,
            source: 'iyzipay-sdk',
            data: r,
          });
        }
      } catch (e) {
        lastError = e;
      }

      // Try by conversationId
      try {
        const r2 = await retrievePayment({
          conversationId: String(transactionId),
        });
        if (r2 && (String((r2 as any).status).toLowerCase() === 'success' || (r2 as any).status)) {
          return NextResponse.json({
            success: true,
            found: true,
            source: 'iyzipay-sdk',
            data: r2,
          });
        }
      } catch (e) {
        lastError = e;
      }
    }

    // Try by conversationId using orderId
    if (orderId) {
      try {
        const r3 = await retrievePayment({ conversationId: String(orderId) });
        if (r3 && (String((r3 as any).status).toLowerCase() === 'success' || (r3 as any).status)) {
          return NextResponse.json({
            success: true,
            found: true,
            source: 'iyzipay-sdk',
            data: r3,
          });
        }
      } catch (e) {
        lastError = e;
      }
    }

    return NextResponse.json({
      success: true,
      found: false,
      message: 'No Iyzico payment found via API (SDK)',
      lastError: lastError ? String((lastError as any).message || lastError) : null,
    });
  } catch (error: any) {
    console.error('Error checking payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
