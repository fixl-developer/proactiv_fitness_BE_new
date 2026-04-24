import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerRevenueDoc extends Document {
    partnerId: string;
    month: string;
    revenue: number;
    students: number;
    bookings: number;
    rating: number;
}

const partnerRevenueSchema = new Schema<IPartnerRevenueDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        month: { type: String, required: true },
        revenue: { type: Number, default: 0, min: 0 },
        students: { type: Number, default: 0, min: 0 },
        bookings: { type: Number, default: 0, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_revenue' }
);

partnerRevenueSchema.index({ partnerId: 1, month: 1 }, { unique: true });

export const PartnerRevenue = model<IPartnerRevenueDoc>('PartnerRevenue', partnerRevenueSchema);
