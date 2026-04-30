import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerLeadDoc extends Document {
    partnerId: string;
    name: string;
    email: string;
    phone?: string;
    source?: string;
    status: string;
    interestLevel: string;
}

const partnerLeadSchema = new Schema<IPartnerLeadDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        source: { type: String, trim: true },
        status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
        interestLevel: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_leads' }
);

partnerLeadSchema.index({ partnerId: 1, status: 1 });
partnerLeadSchema.index({ email: 1 });

export const PartnerLead = model<IPartnerLeadDoc>('PartnerLead', partnerLeadSchema);
