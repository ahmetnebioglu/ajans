import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

    // Use Iyzico REST API directly instead of SDK
    const retrievePayment = async (paymentId: string) => {
      try {
        const response = await axios.post(
          `${baseUrl}/payment/detail`,
          {
            locale: 'tr',
            conversationId: paymentId,
          },
          {
            auth: {
              username: apiKey,
              password: secretKey,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    };

    let lastError = null;

    // Try by transactionId
    if (transactionId) {
      try {
        const r = await retrievePayment(String(transactionId));
        if (r && (r.status === 'success' || r.status)) {
          return NextResponse.json({
            success: true,
            found: true,
            source: 'iyzico-api',
            data: r,
          });
        }
      } catch (e) {
        lastError = e;
      }
    }

    // Try by orderId
    if (orderId) {
      try {
        const r = await retrievePayment(String(orderId));
        if (r && (r.status === 'success' || r.status)) {
          return NextResponse.json({
            success: true,
            found: true,
            source: 'iyzico-api',
            data: r,
          });
        }
      } catch (e) {
        lastError = e;
      }
    }

    return NextResponse.json({
      success: true,
      found: false,
      message: 'No Iyzico payment found via API',
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
