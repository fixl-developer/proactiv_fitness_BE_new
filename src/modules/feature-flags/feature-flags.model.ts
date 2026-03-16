import { Schema, model, Document } from 'mongoose';

export interface IFeatureFlagDocument extends Document {
    flagId: string;
    tenantId: string;
    name: string;
    description?: string;
    enabled: boolean;
    rolloutPercentage: number;
    targetUsers: string[];
    createdAt: Date;
    updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlagDocument>(
    {
        flagId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        name: { type: String, required: true },
        description: String,
        enabled: { type: Boolean, default: false },
        rolloutPercentage: { type: Number, default: 100 },
        targetUsers: [String],
    },
    { timestamps: true }
);

export const FeatureFlagsModel = model<IFeatureFlagDocument>('FeatureFlag', featureFlagSchema);
