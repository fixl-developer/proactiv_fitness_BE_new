import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerProgramDoc extends Document {
    partnerId: string;
    name: string;
    description: string;
    category: string;
    status: string;
    enrolledStudents: number;
    revenue: number;
    rating: number;
}

const partnerProgramSchema = new Schema<IPartnerProgramDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        category: { type: String, trim: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        enrolledStudents: { type: Number, default: 0, min: 0 },
        revenue: { type: Number, default: 0, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_programs' }
);

partnerProgramSchema.index({ partnerId: 1, status: 1 });
partnerProgramSchema.index({ category: 1 });

export const PartnerProgram = model<IPartnerProgramDoc>('PartnerProgram', partnerProgramSchema);
