import mongoose, { Document, Schema } from 'mongoose';
import { InvoiceData } from '@/lib/utils/invoice-generator';

// Invoice document interface
export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  data: InvoiceData;
  htmlContent: string;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Schema
const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
InvoiceSchema.index({ orderId: 1 });
InvoiceSchema.index({ userId: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Compound indexes
InvoiceSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
