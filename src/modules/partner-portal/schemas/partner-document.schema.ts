import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerDocumentDoc extends Document {
    partnerId: string;
    name: string;
    type: string;
    description?: string;
    url?: string;
    size?: string;
    downloads: number;
    rating: number;
    tags: string[];
    featured: boolean;
    status: string;
}

const partnerDocumentSchema = new Schema<IPartnerDocumentDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ['pdf', 'video', 'zip', 'excel', 'image', 'doc'], default: 'pdf' },
        description: { type: String, trim: true },
        url: { type: String },
        size: { type: String },
        downloads: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        tags: [{ type: String }],
        featured: { type: Boolean, default: false },
        status: { type: String, enum: ['active', 'archived'], default: 'active' },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_documents' }
);

partnerDocumentSchema.index({ partnerId: 1, status: 1 });
partnerDocumentSchema.index({ type: 1 });

export const PartnerDocument = model<IPartnerDocumentDoc>('PartnerDocument', partnerDocumentSchema);
