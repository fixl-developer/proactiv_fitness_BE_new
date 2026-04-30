import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

interface IPartnerSettingsProfile {
    organizationName?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
}

interface IPartnerSettingsBilling {
    billingEmail?: string;
    paymentMethod?: string;
    billingAddress?: string;
    taxId?: string;
}

interface IPartnerSettingsApi {
    apiKey?: string;
    webhookUrl?: string;
    environment?: string;
}

interface IPartnerSettingsNotifications {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    webhookNotifications?: boolean;
    dailyDigest?: boolean;
    weeklyReport?: boolean;
}

export interface IPartnerSettingsDoc extends Document {
    partnerId: string;
    profile: IPartnerSettingsProfile;
    billing: IPartnerSettingsBilling;
    api: IPartnerSettingsApi;
    notifications: IPartnerSettingsNotifications;
}

const partnerSettingsSchema = new Schema<IPartnerSettingsDoc>(
    {
        partnerId: { type: String, required: true, unique: true, index: true },
        profile: {
            organizationName: { type: String },
            contactPerson: { type: String },
            email: { type: String },
            phone: { type: String },
            website: { type: String },
            address: { type: String },
        },
        billing: {
            billingEmail: { type: String },
            paymentMethod: { type: String },
            billingAddress: { type: String },
            taxId: { type: String },
        },
        api: {
            apiKey: { type: String },
            webhookUrl: { type: String },
            environment: { type: String, default: 'production' },
        },
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            webhookNotifications: { type: Boolean, default: true },
            dailyDigest: { type: Boolean, default: true },
            weeklyReport: { type: Boolean, default: true },
        },
        ...baseSchemaFields,
    },
    { ...baseSchemaOptions, timestamps: true, collection: 'partner_settings' }
);

partnerSettingsSchema.index({ partnerId: 1 }, { unique: true });

export const PartnerSettings = model<IPartnerSettingsDoc>('PartnerSettings', partnerSettingsSchema);
