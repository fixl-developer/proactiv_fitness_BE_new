import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerAgreementDoc extends Document {
    partnerId: string;
    type: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    terms?: string;
    signedAt?: Date;
}

const partnerAgreementSchema = new Schema<IPartnerAgreementDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        type: { type: String, required: true, trim: true },
        status: { type: String, enum: ['active', 'expired', 'pending'], default: 'active' },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        terms: { type: String },
        signedAt: { type: Date },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_agreements' }
);

partnerAgreementSchema.index({ partnerId: 1, status: 1 });

export const PartnerAgreement = model<IPartnerAgreementDoc>('PartnerAgreement', partnerAgreementSchema);
