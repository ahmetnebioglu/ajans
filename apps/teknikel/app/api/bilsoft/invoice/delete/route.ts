import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Bilsoft faturasını siler
 * E-fatura kontrolü yaparak silmeyi engeller
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const bilsoftToken = (session as any)?.user?.bilsoftToken || '';

    // Fatura detayını çek
    let invoiceDetail: any = null;
    try {
      const detailResponse = await axios.get(
        `https://apiv3.bilsoft.com/api/Fatura/getbyid?id=${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${bilsoftToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      invoiceDetail = detailResponse.data?.data;
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          message: 'Fatura bulunamadı',
        },
        { status: 404 }
      );
    }

    // E-fatura kontrolü
    if (invoiceDetail?.eFaturaDurum && invoiceDetail.eFaturaDurum !== '') {
      return NextResponse.json(
        {
          success: false,
          message: 'E-fatura gönderilen faturalar silinemez',
          eFaturaDurum: invoiceDetail.eFaturaDurum,
        },
        { status: 400 }
      );
    }

    // Faturayı sil
    try {
      const deleteResponse = await axios.post(
        `https://apiv3.bilsoft.com/api/Fatura/delete?id=${invoiceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${bilsoftToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!deleteResponse.data?.success) {
        return NextResponse.json(
          {
            success: false,
            message: deleteResponse.data?.message || 'Fatura silinemedi',
          },
          { status: 400 }
        );
      }

      console.log(`[invoice-delete] Fatura silindi: ${invoiceId}`);

      return NextResponse.json({
        success: true,
        message: 'Fatura başarıyla silindi',
        invoiceId: invoiceId,
      });
    } catch (deleteError) {
      console.error('[invoice-delete] Silme hatası:', (deleteError as any).message);
      return NextResponse.json(
        {
          success: false,
          message: (deleteError as any).response?.data?.message || 'Fatura silinirken hata oluştu',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[invoice-delete] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
