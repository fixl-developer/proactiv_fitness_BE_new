import { Schema, model } from 'mongoose';

const tenantSchema = new Schema({
    name: { type: String, required: true },
    domain: { type: String, unique: true },
    plan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter' },
    status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
    branding: {
        logo: String,
        primaryColor: String,
        secondaryColor: String,
        favicon: String,
        customDomain: String
    },
    billing: {
        monthlyFee: Number,
        status: String,
        nextBillingDate: Date
    },
    apiKeys: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

tenantSchema.index({ domain: 1 });
tenantSchema.index({ status: 1 });

export default model('Tenant', tenantSchema);
