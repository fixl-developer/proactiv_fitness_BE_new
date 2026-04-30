import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerStudentDoc extends Document {
    partnerId: string;
    name: string;
    email: string;
    phone: string;
    enrolledPrograms: number;
    totalSpent: number;
    status: string;
    joinDate: Date;
    lastActivity: Date;
}

const partnerStudentSchema = new Schema<IPartnerStudentDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        enrolledPrograms: { type: Number, default: 1, min: 0 },
        totalSpent: { type: Number, default: 0, min: 0 },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        joinDate: { type: Date, default: Date.now },
        lastActivity: { type: Date, default: Date.now },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_students' }
);

partnerStudentSchema.index({ partnerId: 1, status: 1 });
partnerStudentSchema.index({ email: 1 });
partnerStudentSchema.index({ joinDate: -1 });

export const PartnerStudent = model<IPartnerStudentDoc>('PartnerStudent', partnerStudentSchema);
