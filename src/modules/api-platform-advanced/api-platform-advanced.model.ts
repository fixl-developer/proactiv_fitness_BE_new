import mongoose, { Schema, Document } from 'mongoose';

const APIPlatformAdvancedSchema = new Schema({
    type: { type: String, enum: ['key', 'app', 'webhook', 'analytics'] },
    developerId: String,
    apiKey: String,
    clientId: String,
    clientSecret: String,
    name: String,
    description: String,
    redirectUrl: String,
    permissions: [String],
    isActive: Boolean,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const APIPlatformAdvancedModel = mongoose.model('APIPlatformAdvanced', APIPlatformAdvancedSchema);
