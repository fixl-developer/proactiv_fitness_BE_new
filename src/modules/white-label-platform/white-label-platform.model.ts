import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    tenantId: string;
    name: string;
    email: string;
    customDomain?: string;
    database: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITenantBranding extends Document {
    tenantId: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    customCSS?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITenantAnalytics extends Document {
    tenantId: string;
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    churnRate: number;
    createdAt: Date;
}

export interface IUsageBasedPricing extends Document {
    tenantId: string;
    basePrice: number;
    pricePerUser: number;
    pricePerTransaction: number;
    pricePerAPI: number;
    createdAt: Date;
    updatedAt: Date;
}

const WhiteLabelPlatformSchema = new Schema({
    type: { type: String, enum: ['tenant', 'branding', 'billing', 'user', 'api', 'pricing'] },
    tenantId: String,
    name: String,
    email: String,
    customDomain: String,
    database: String,
    isActive: Boolean,
    logo: String,
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String,
    customCSS: String,
    totalUsers: Number,
    activeUsers: Number,
    totalRevenue: Number,
    monthlyRecurringRevenue: Number,
    churnRate: Number,
    basePrice: Number,
    pricePerUser: Number,
    pricePerTransaction: Number,
    pricePerAPI: Number,
    apiKey: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const WhiteLabelPlatformModel = mongoose.model('WhiteLabelPlatform', WhiteLabelPlatformSchema);
