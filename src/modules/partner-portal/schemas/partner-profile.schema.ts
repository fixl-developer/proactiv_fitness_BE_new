import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerProfileDoc extends Document {
    partnerId: string;
    partnerName: string;
    partnerType: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    website?: string;
    logo?: string;
    businessName: string;
    businessType: string;
    location: string;
    status: string;
    tier: string;
    commissionRate: number;
    joinDate: Date;
    rating: number;
}

const partnerProfileSchema = new Schema<IPartnerProfileDoc>(
    {
        partnerId: { type: String, required: true, unique: true, index: true },
        partnerName: { type: String, required: true, trim: true },
        partnerType: { type: String, enum: ['school', 'corporate', 'institution', 'ngo', 'sports_academy'], default: 'sports_academy' },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, default: 'India' },
        website: { type: String, trim: true },
        logo: { type: String },
        businessName: { type: String, trim: true },
        businessType: { type: String, trim: true },
        location: { type: String, trim: true },
        status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'active' },
        tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'gold' },
        commissionRate: { type: Number, default: 15, min: 0, max: 100 },
        joinDate: { type: Date, default: Date.now },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_profiles' }
);

partnerProfileSchema.index({ email: 1 });
partnerProfileSchema.index({ status: 1 });
partnerProfileSchema.index({ tier: 1 });

export const PartnerProfile = model<IPartnerProfileDoc>('PartnerProfile', partnerProfileSchema);
