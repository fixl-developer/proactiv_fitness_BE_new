import mongoose, { Schema } from 'mongoose';
import { IIntegration, IIntegrationLog, IWebhook } from './integration.interface';

const IntegrationSchema = new Schema<IIntegration>({
    integrationId: { type: String, required: true, unique: true, index: true },
    integrationType: {
        type: String,
        required: true,
        enum: ['payment_gateway', 'accounting', 'email_sms', 'calendar', 'access_control', 'third_party_api']
    },
    provider: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    config: {
        apiKey: { type: String },
        apiSecret: { type: String },
        webhookUrl: { type: String },
        environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
        customSettings: { type: Schema.Types.Mixed }
    },
    status: { type: String, enum: ['active', 'inactive', 'error', 'pending'], default: 'pending' },
    healthCheck: {
        lastChecked: { type: Date },
        isHealthy: { type: Boolean, default: false },
        errorMessage: { type: String }
    },
    usage: {
        totalCalls: { type: Number, default: 0 },
        successfulCalls: { type: Number, default: 0 },
        failedCalls: { type: Number, default: 0 },
        lastUsed: { type: Date }
    },
    businessUnitId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const IntegrationLogSchema = new Schema<IIntegrationLog>({
    logId: { type: String, required: true, unique: true, index: true },
    integrationId: { type: String, required: true, index: true },
    integrationType: { type: String, required: true },
    provider: { type: String, required: true },
    action: { type: String, required: true },
    request: {
        method: { type: String, required: true },
        endpoint: { type: String, required: true },
        payload: { type: Schema.Types.Mixed }
    },
    response: {
        statusCode: { type: Number, required: true },
        data: { type: Schema.Types.Mixed },
        error: { type: String }
    },
    duration: { type: Number, required: true },
    success: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now, index: true }
});

const WebhookSchema = new Schema<IWebhook>({
    webhookId: { type: String, required: true, unique: true, index: true },
    integrationId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    processedAt: { type: Date },
    errorMessage: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
});

export const Integration = mongoose.model<IIntegration>('Integration', IntegrationSchema);
export const IntegrationLog = mongoose.model<IIntegrationLog>('IntegrationLog', IntegrationLogSchema);
export const Webhook = mongoose.model<IWebhook>('Webhook', WebhookSchema);
