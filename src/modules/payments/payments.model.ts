import { Schema, model, Document } from 'mongoose';

export interface IPaymentDocument extends Document {
    transactionId: string;
    userId: string;
    tenantId: string;
    amount: number;
    currency: string;
    paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'line_pay';
    gateway: 'stripe' | 'paypal' | 'line_pay';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    description: string;
    metadata: Record<string, any>;
    gatewayTransactionId: string;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
    {
        transactionId: { type: String, required: true, unique: true },
        userId: { type: String, required: true },
        tenantId: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        paymentMethod: { type: String, required: true },
        gateway: { type: String, required: true },
        status: { type: String, default: 'pending' },
        description: { type: String },
        metadata: { type: Schema.Types.Mixed },
        gatewayTransactionId: { type: String },
    },
    { timestamps: true }
);

export const PaymentModel = model<IPaymentDocument>('Payment', paymentSchema);
