import { Schema, model, Document } from 'mongoose';

export interface IBillingDocument extends Document {
    billingId: string;
    userId: string;
    tenantId: string;
    amount: number;
    currency: string;
    billingPeriod: 'monthly' | 'quarterly' | 'annual';
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    dueDate: Date;
    paidDate?: Date;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const billingSchema = new Schema<IBillingDocument>(
    {
        billingId: { type: String, required: true, unique: true },
        userId: { type: String, required: true },
        tenantId: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        billingPeriod: { type: String, required: true },
        status: { type: String, default: 'draft' },
        dueDate: { type: Date, required: true },
        paidDate: { type: Date },
        items: [
            {
                description: String,
                quantity: Number,
                unitPrice: Number,
                total: Number,
            },
        ],
        notes: String,
    },
    { timestamps: true }
);

export const BillingModel = model<IBillingDocument>('Billing', billingSchema);
