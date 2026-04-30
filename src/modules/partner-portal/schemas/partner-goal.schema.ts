import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPartnerGoalDoc extends Document {
    partnerId: string;
    goalName: string;
    targetValue: number;
    currentValue: number;
    progress: number;
    status: string;
    dueDate: Date;
}

const partnerGoalSchema = new Schema<IPartnerGoalDoc>(
    {
        partnerId: { type: String, required: true, index: true },
        goalName: { type: String, required: true, trim: true },
        targetValue: { type: Number, required: true, min: 0 },
        currentValue: { type: Number, default: 0, min: 0 },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        status: { type: String, enum: ['on-track', 'at-risk', 'off-track', 'completed'], default: 'on-track' },
        dueDate: { type: Date, required: true },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_goals' }
);

partnerGoalSchema.index({ partnerId: 1, status: 1 });

export const PartnerGoal = model<IPartnerGoalDoc>('PartnerGoal', partnerGoalSchema);
