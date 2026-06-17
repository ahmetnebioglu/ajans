import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { sendNetgsmSms } from '@/lib/netgsm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ideasoft/sms/send
 * Tekli SMS gönderimi
 * Body: { reciever: string, msgTxt: string, smsType?: string }
 */
export async function POST(request: NextRequest) {
  const requestId = `sms-send-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { status: 'error', message: 'Bu işlem için yetkiniz bulunmamaktadır.' },
      { status: 401 }
    );
  }

  try {

    const body = await request.json();
    const { reciever, msgTxt, smsType = 'manual' } = body;

    if (!reciever || !msgTxt) {
      return NextResponse.json(
        { status: 'error', message: 'Alıcı numarası ve SMS metni gereklidir.' },
        { status: 400 }
      );
    }

    const result = await sendNetgsmSms({
      receiver: reciever,
      message: msgTxt,
      type: smsType,
      saveToDb: true,
    });

    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: result.message,
        responseCode: result.responseCode,
        messageId: result.messageId,
        smsId: result.smsId,
      });
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: result.message,
          responseCode: result.responseCode,
          smsId: result.smsId,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`[${requestId}] SMS send error:`, error.message);
    return NextResponse.json(
      {
        status: 'error',
        message: 'SMS gönderilemedi: Sunucu hatası',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
