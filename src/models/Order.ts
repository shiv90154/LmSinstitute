import mongoose, { Document, Schema } from 'mongoose';

// Order item subdocument interface
export interface IOrderItem extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'course' | 'book' | 'material' | 'test';
  itemId: mongoose.Types.ObjectId;
  price: number;
  title: string;
}

// Order document interface
export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentDetails: {
    method?: string;
    status?: string;
    paidAt?: Date;
    failureReason?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
const OrderItemSchema = new Schema<IOrderItem>({
  type: {
    type: String,
    enum: ['course', 'book', 'material', 'test'],
    required: true,
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'items.type',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: true,
});

// Order Schema
const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  paymentDetails: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ razorpayPaymentId: 1 });
OrderSchema.index({ createdAt: -1 });

// Compound indexes
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
