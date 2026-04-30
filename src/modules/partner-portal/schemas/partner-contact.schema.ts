import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerContactDoc extends Document {
    partnerId: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isPrimary: boolean;
}

const partnerContactSchema = new Schema<IPartnerContactDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        role: { type: String, trim: true },
        isPrimary: { type: Boolean, default: false },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_contacts' }
);

partnerContactSchema.index({ partnerId: 1 });

export const PartnerContact = model<IPartnerContactDoc>('PartnerContact', partnerContactSchema);
