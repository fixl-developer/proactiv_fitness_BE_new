import mongoose, { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '../../shared/base/base.model';

// ── API Key ──────────────────────────────────────────────────────────────────

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
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const apiKeySchema = new Schema<IAPIKeyDocument>(
    {
        keyId: { type: String, required: true, unique: true },
        tenantId: { type: String, required: true, index: true },
        name: { type: String, required: true },
        key: { type: String, required: true, unique: true },
        secret: { type: String, required: true },
        permissions: [String],
        rateLimit: { type: Number, default: 1000 },
        status: { type: String, enum: ['active', 'inactive', 'revoked'], default: 'active' },
        lastUsed: Date,
        ...baseSchemaFields,
    },
    baseSchemaOptions as any,
);

export const APIKeyModel = model<IAPIKeyDocument>('APIKey', apiKeySchema);

// ── OAuth App ────────────────────────────────────────────────────────────────

export interface IOAuthAppDocument extends Document {
    name: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    userId: Schema.Types.ObjectId;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const oAuthAppSchema = new Schema<IOAuthAppDocument>(
    {
        name: { type: String, required: true },
        clientId: { type: String, required: true, unique: true },
        clientSecret: { type: String, required: true },
        redirectUri: { type: String, required: true },
        scopes: { type: [String], default: [] },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        isActive: { type: Boolean, default: true },
        ...baseSchemaFields,
    },
    baseSchemaOptions as any,
);

export const OAuthAppModel = model<IOAuthAppDocument>('OAuthApp', oAuthAppSchema);

// ── Webhook ──────────────────────────────────────────────────────────────────

export interface IWebhookDocument extends Document {
    url: string;
    events: string[];
    secret: string;
    userId: Schema.Types.ObjectId;
    isActive: boolean;
    lastTriggered?: Date;
    failCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const webhookSchema = new Schema<IWebhookDocument>(
    {
        url: { type: String, required: true },
        events: { type: [String], required: true },
        secret: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        isActive: { type: Boolean, default: true },
        lastTriggered: { type: Date, default: null },
        failCount: { type: Number, default: 0 },
        ...baseSchemaFields,
    },
    baseSchemaOptions as any,
);

export const WebhookModel = (mongoose.models['ApiDevWebhook'] as any) || model<IWebhookDocument>('ApiDevWebhook', webhookSchema);

// ── API Usage Log ────────────────────────────────────────────────────────────

export interface IApiUsageLogDocument extends Document {
    appId: Schema.Types.ObjectId;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
    userId: Schema.Types.ObjectId;
}

const apiUsageLogSchema = new Schema<IApiUsageLogDocument>(
    {
        appId: { type: Schema.Types.ObjectId, ref: 'OAuthApp', required: true, index: true },
        endpoint: { type: String, required: true },
        method: { type: String, required: true },
        statusCode: { type: Number, required: true },
        responseTime: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    },
    baseSchemaOptions as any,
);

export const ApiUsageLogModel = model<IApiUsageLogDocument>('ApiUsageLog', apiUsageLogSchema);
