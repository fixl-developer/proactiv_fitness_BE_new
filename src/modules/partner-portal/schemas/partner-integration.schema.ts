import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerIntegrationDoc extends Document {
    partnerId: string;
    name: string;
    description?: string;
    category?: string;
    type?: string;
    status: string;
    iconName?: string;
    color?: string;
    bgColor?: string;
    lastSync?: Date;
    syncFrequency: string;
    dataPoints: number;
    health: number;
}

const partnerIntegrationSchema = new Schema<IPartnerIntegrationDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        category: { type: String, trim: true },
        type: { type: String, trim: true },
        status: { type: String, enum: ['connected', 'disconnected', 'error', 'pending'], default: 'disconnected' },
        iconName: { type: String },
        color: { type: String },
        bgColor: { type: String },
        lastSync: { type: Date },
        syncFrequency: { type: String, default: 'Manual' },
        dataPoints: { type: Number, default: 0 },
        health: { type: Number, default: 0, min: 0, max: 100 },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_integrations' }
);

partnerIntegrationSchema.index({ partnerId: 1, status: 1 });

export const PartnerIntegration = model<IPartnerIntegrationDoc>('PartnerIntegration', partnerIntegrationSchema);
