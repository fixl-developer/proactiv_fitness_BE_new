import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerCommissionDoc extends Document {
    partnerId: string;
    amount: number;
    rate: number;
    period: string;
    status: string;
    calculatedAt: Date;
    paidAt?: Date;
    notes?: string;
}

const partnerCommissionSchema = new Schema<IPartnerCommissionDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        rate: { type: Number, required: true, min: 0, max: 100 },
        period: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'paid', 'disputed'], default: 'pending' },
        calculatedAt: { type: Date, default: Date.now },
        paidAt: { type: Date },
        notes: { type: String },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_commissions' }
);

partnerCommissionSchema.index({ partnerId: 1, status: 1 });
partnerCommissionSchema.index({ period: 1 });

export const PartnerCommission = model<IPartnerCommissionDoc>('PartnerCommission', partnerCommissionSchema);
