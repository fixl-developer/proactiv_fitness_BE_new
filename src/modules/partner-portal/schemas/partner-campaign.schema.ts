import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerCampaignDoc extends Document {
    partnerId: string;
    name: string;
    type: string;
    status: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
    startDate?: Date;
    endDate?: Date;
}

const partnerCampaignSchema = new Schema<IPartnerCampaignDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ['email', 'social', 'display', 'sms'], default: 'email' },
        status: { type: String, enum: ['active', 'paused', 'completed', 'draft'], default: 'draft' },
        budget: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        roi: { type: Number, default: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_campaigns' }
);

partnerCampaignSchema.index({ partnerId: 1, status: 1 });

export const PartnerCampaign = model<IPartnerCampaignDoc>('PartnerCampaign', partnerCampaignSchema);
