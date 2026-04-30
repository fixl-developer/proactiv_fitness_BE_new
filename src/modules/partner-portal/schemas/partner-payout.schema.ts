import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerPayoutDoc extends Document {
    partnerId: string;
    amount: number;
    method: string;
    status: string;
    notes?: string;
    bankDetails?: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        ifscCode?: string;
    };
    paypalEmail?: string;
    upiId?: string;
    reference?: string;
    requestedAt: Date;
    processedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
}

const partnerPayoutSchema = new Schema<IPartnerPayoutDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        method: { type: String, enum: ['bank_transfer', 'paypal', 'upi', 'check'], default: 'bank_transfer' },
        status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'rejected'], default: 'pending' },
        notes: { type: String },
        bankDetails: {
            accountName: { type: String },
            accountNumber: { type: String },
            accountType: { type: String },
            bankName: { type: String },
            ifscCode: { type: String },
        },
        paypalEmail: { type: String },
        upiId: { type: String },
        reference: { type: String },
        requestedAt: { type: Date, default: Date.now },
        processedAt: { type: Date },
        rejectedAt: { type: Date },
        rejectionReason: { type: String },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_payouts' }
);

partnerPayoutSchema.index({ partnerId: 1, status: 1 });
partnerPayoutSchema.index({ requestedAt: -1 });

export const PartnerPayout = model<IPartnerPayoutDoc>('PartnerPayout', partnerPayoutSchema);
