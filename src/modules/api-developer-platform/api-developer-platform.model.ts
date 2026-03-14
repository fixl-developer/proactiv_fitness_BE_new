import { Schema, model, Document } from 'mongoose';

export interface IAPIKeyDocument extends Document {
    keyId: string;
    tenantId: string;
    name: string;
    key: string;
    secret: string;
    permissions: string[];
    rateLimit: number;
    status: 'active' | 'inactive' | 'revoked';
    lastUsed?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const apiKeySchema = new Schema<IAPIKeyDocument>(
    {
        keyId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true },
        name: { type: String, required: true },
        key: { type: String, required: true, unique: true },
        secret: { type: String, required: true },
        permissions: [String],
        rateLimit: { type: Number, default: 1000 },
        status: { type: String, default: 'active' },
        lastUsed: Date,
    },
    { timestamps: true }
);

export const APIKeyModel = model<IAPIKeyDocument>('APIKey', apiKeySchema);
