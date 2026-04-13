import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../../shared/base/base.model';

// --- SaaS Tenant ---

export interface ISaaSTenantDocument extends Document {
    name: string;
    domain: string;
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'inactive';
    ownerId: Schema.Types.ObjectId;
    config: Record<string, any>;
    features: string[];
    branding: {
        logo?: string;
        primaryColor?: string;
        secondaryColor?: string;
        favicon?: string;
        customDomain?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const tenantSchema = new Schema<ISaaSTenantDocument>(
    {
        name: { type: String, required: true },
        domain: { type: String, unique: true },
        plan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter' },
        status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
        ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
        config: { type: Schema.Types.Mixed, default: {} },
        features: [{ type: String }],
        branding: {
            logo: String,
            primaryColor: String,
            secondaryColor: String,
            favicon: String,
            customDomain: String,
        },
    },
    baseSchemaOptions,
);

tenantSchema.index({ domain: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ ownerId: 1 });

// --- SaaS Usage Metric ---

export interface ISaaSUsageMetricDocument extends Document {
    tenantId: Schema.Types.ObjectId;
    period: string;
    apiCalls: number;
    storage: number;
    users: number;
    bandwidth: number;
    createdAt: Date;
    updatedAt: Date;
}

const usageMetricSchema = new Schema<ISaaSUsageMetricDocument>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'SaaSTenant', required: true },
        period: { type: String, required: true },
        apiCalls: { type: Number, default: 0 },
        storage: { type: Number, default: 0 },
        users: { type: Number, default: 0 },
        bandwidth: { type: Number, default: 0 },
    },
    baseSchemaOptions,
);

usageMetricSchema.index({ tenantId: 1, period: 1 }, { unique: true });

// --- SaaS Billing ---

export interface ISaaSBillingDocument extends Document {
    tenantId: Schema.Types.ObjectId;
    plan: 'starter' | 'professional' | 'enterprise';
    monthlyFee: number;
    status: 'active' | 'past_due' | 'cancelled' | 'trialing';
    nextBillingDate: Date;
    paymentMethod: {
        type: string;
        last4?: string;
        brand?: string;
        expiryMonth?: number;
        expiryYear?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const billingSchema = new Schema<ISaaSBillingDocument>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'SaaSTenant', required: true, unique: true },
        plan: { type: String, enum: ['starter', 'professional', 'enterprise'], required: true },
        monthlyFee: { type: Number, required: true },
        status: { type: String, enum: ['active', 'past_due', 'cancelled', 'trialing'], default: 'active' },
        nextBillingDate: { type: Date, required: true },
        paymentMethod: {
            type: { type: String },
            last4: String,
            brand: String,
            expiryMonth: Number,
            expiryYear: Number,
        },
    },
    baseSchemaOptions,
);

billingSchema.index({ tenantId: 1 });
billingSchema.index({ status: 1 });

// --- SaaS API Key ---

export interface ISaaSApiKeyDocument extends Document {
    tenantId: Schema.Types.ObjectId;
    key: string;
    name: string;
    permissions: string[];
    isActive: boolean;
    lastUsed: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const apiKeySchema = new Schema<ISaaSApiKeyDocument>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'SaaSTenant', required: true },
        key: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        permissions: [{ type: String }],
        isActive: { type: Boolean, default: true },
        lastUsed: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
    },
    baseSchemaOptions,
);

apiKeySchema.index({ tenantId: 1 });
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ isActive: 1 });

// --- Exports ---

const SaaSTenant = model<ISaaSTenantDocument>('SaaSTenant', tenantSchema);
export const SaaSUsageMetric = model<ISaaSUsageMetricDocument>('SaaSUsageMetric', usageMetricSchema);
export const SaaSBilling = model<ISaaSBillingDocument>('SaaSBilling', billingSchema);
export const SaaSApiKey = model<ISaaSApiKeyDocument>('SaaSApiKey', apiKeySchema);

export default SaaSTenant;
