import { Schema, model, Document } from 'mongoose';

export interface IIntegrationDocument extends Document {
    integrationId: string;
    tenantId: string;
    provider: string;
    status: 'active' | 'inactive' | 'error';
    credentials: Record<string, any>;
    config: Record<string, any>;
    lastSyncedAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const integrationSchema = new Schema<IIntegrationDocument>(
    {
        integrationId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        provider: { type: String, required: true },
        status: { type: String, default: 'active' },
        credentials: { type: Schema.Types.Mixed },
        config: { type: Schema.Types.Mixed },
        lastSyncedAt: Date,
        errorMessage: String,
    },
    { timestamps: true }
);

export const IntegrationModel = model<IIntegrationDocument>('Integration', integrationSchema);
