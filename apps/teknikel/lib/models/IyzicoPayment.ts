import mongoose from 'mongoose';

interface IyzicoPaymentLog {
  action: 'created' | 'updated' | 'status_changed' | 'refund';
  previousStatus?: string;
  newStatus?: string;
  changes?: Record<string, any>;
  timestamp: Date;
  webhookData?: Record<string, any>;
}

interface IyzicoPaymentDocument extends mongoose.Document {
  orderReferenceCode: string;
  customerReferenceCode: string;
  subscriptionReferenceCode?: string;
  iyziReferenceCode: string;
  iyziEventType: 'subscription.order.success' | 'subscription.order.failure' | 'payment.success' | 'payment.failure' | 'refund' | 'unknown';
  iyziEventTime: number;
  eventDate?: Date;
  status: 'success' | 'failure' | 'pending' | 'refunded' | 'unknown';
  paymentDetails?: {
    price?: string;
    paidPrice?: string;
    currency?: string;
    installment?: number;
  };
  customerDetails?: Record<string, any>;
  orderDetails?: Record<string, any>;
  refund?: {
    refundId?: string;
    refundAmount?: string;
    refundedAt?: Date;
  };
  rawWebhookData?: Record<string, any>;
  logs: IyzicoPaymentLog[];
  processed: boolean;
  processedAt?: Date;
  error?: {
    hasError: boolean;
    errorMessage?: string;
    errorAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const IyzicoPaymentLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'status_changed', 'refund'],
  },
  previousStatus: String,
  newStatus: String,
  changes: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  webhookData: mongoose.Schema.Types.Mixed,
});

const IyzicoPaymentSchema = new mongoose.Schema<IyzicoPaymentDocument>(
  {
    orderReferenceCode: {
      type: String,
      required: true,
      unique: true,
    },
    customerReferenceCode: {
      type: String,
      required: true,
    },
    subscriptionReferenceCode: {
      type: String,
    },
    iyziReferenceCode: {
      type: String,
      required: true,
    },
    iyziEventType: {
      type: String,
      required: true,
      enum: [
        'subscription.order.success',
        'subscription.order.failure',
        'payment.success',
        'payment.failure',
        'refund',
        'unknown',
      ],
    },
    iyziEventTime: {
      type: Number,
      required: true,
    },
    eventDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'pending', 'refunded', 'unknown'],
      default: 'unknown',
    },
    paymentDetails: {
      price: String,
      paidPrice: String,
      currency: String,
      installment: Number,
    },
    customerDetails: mongoose.Schema.Types.Mixed,
    orderDetails: mongoose.Schema.Types.Mixed,
    refund: {
      refundId: String,
      refundAmount: String,
      refundedAt: Date,
    },
    rawWebhookData: mongoose.Schema.Types.Mixed,
    logs: [IyzicoPaymentLogSchema],
    processed: {
      type: Boolean,
      default: false,
    },
    processedAt: Date,
    error: {
      hasError: {
        type: Boolean,
        default: false,
      },
      errorMessage: String,
      errorAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
IyzicoPaymentSchema.index({ createdAt: -1 });
IyzicoPaymentSchema.index({ customerReferenceCode: 1 });
IyzicoPaymentSchema.index({ subscriptionReferenceCode: 1 });
IyzicoPaymentSchema.index({ iyziReferenceCode: 1 });
IyzicoPaymentSchema.index({ iyziEventType: 1, status: 1 });
IyzicoPaymentSchema.index({ processed: 1 });
IyzicoPaymentSchema.index({ eventDate: -1 });

export default mongoose.models.IyzicoPayment ||
  mongoose.model<IyzicoPaymentDocument>('IyzicoPayment', IyzicoPaymentSchema);
