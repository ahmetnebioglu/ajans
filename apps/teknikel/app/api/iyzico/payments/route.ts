import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import IyzicoPayment from '@/lib/models/IyzicoPayment';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const eventType = searchParams.get('eventType') || '';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { orderReferenceCode: { $regex: search, $options: 'i' } },
        { customerReferenceCode: { $regex: search, $options: 'i' } },
        { subscriptionReferenceCode: { $regex: search, $options: 'i' } },
        { iyziReferenceCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (eventType) {
      filter.iyziEventType = eventType;
    }

    const total = await IyzicoPayment.countDocuments(filter);
    const payments = await IyzicoPayment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-rawWebhookData -logs')
      .lean();

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
