import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getIdeasoftOrderById } from '@/src/services/ideasoft';
import { NextResponse } from 'next/server';

/**
 * Ideasoft sipariş detayını çeker ve kalemlerini döner.
 * Fatura oluşturma öncesi stok kontrol için kullanılır.
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
    const { orderId, onlyItems } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await getIdeasoftOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Sipariş kalemlerini çıkar
    const items = (order.orderItems || []).map((item: any) => ({
      sku: item.sku || item.productCode || '',
      name: item.name || item.productName || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    if (onlyItems) {
      return NextResponse.json({
        success: true,
        items,
      });
    }

    return NextResponse.json({
      success: true,
      order,
      items,
    });
  } catch (error) {
    console.error('[InvoiceCheck] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
