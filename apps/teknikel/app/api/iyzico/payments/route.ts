import { NextRequest, NextResponse } from 'next/server';
import { getSecuredPrisma } from '@ajans/db';

export async function GET(request: NextRequest) {
  try {
    const db = getSecuredPrisma('teknikel');

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const eventType = searchParams.get('eventType') || '';

    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (search) {
      where.OR = [
        { orderReferenceCode: { contains: search, mode: 'insensitive' } },
        { customerReferenceCode: { contains: search, mode: 'insensitive' } },
        { subscriptionReferenceCode: { contains: search, mode: 'insensitive' } },
        { iyziReferenceCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (eventType) {
      where.iyziEventType = eventType;
    }

    const [payments, total] = await Promise.all([
      db.iyzicoPayment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          orderReferenceCode: true,
          customerReferenceCode: true,
          subscriptionReferenceCode: true,
          iyziReferenceCode: true,
          iyziEventType: true,
          iyziEventTime: true,
          eventDate: true,
          status: true,
          paymentDetails: true,
          processed: true,
          processedAt: true,
          errorHasError: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.iyzicoPayment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
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
