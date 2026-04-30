import { Schema, model, Document } from 'mongoose';

export interface IFinancialLedgerDocument extends Document {
    entryId: string;
    tenantId: string;
    transactionId: string;
    type: 'credit' | 'debit';
    amount: number;
    currency: string;
    category: 'payment' | 'refund' | 'fee' | 'adjustment' | 'commission';
    description: string;
    relatedEntity: {
        entityType: string;
        entityId: string;
    };
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const financialLedgerSchema = new Schema<IFinancialLedgerDocument>(
    {
        entryId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        transactionId: { type: String, required: true },
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        category: { type: String, required: true },
        description: { type: String },
        relatedEntity: {
            entityType: String,
            entityId: String,
        },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const FinancialLedgerModel = model<IFinancialLedgerDocument>('FinancialLedger', financialLedgerSchema);
