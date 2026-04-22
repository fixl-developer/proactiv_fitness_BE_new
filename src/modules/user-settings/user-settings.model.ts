import mongoose, { Schema, Document } from 'mongoose'

export interface IUserSettings extends Document {
    userId: string
    email: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    notifications: {
        emailNotifications: boolean
        smsNotifications: boolean
        pushNotifications: boolean
        classReminders: boolean
        paymentAlerts: boolean
        promotionalEmails: boolean
    }
    privacy: {
        profileVisibility: 'public' | 'private' | 'friends'
        showAchievements: boolean
        showProgress: boolean
        allowMessaging: boolean
    }
    createdAt: Date
    updatedAt: Date
}

const userSettingsSchema = new Schema<IUserSettings>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            pushNotifications: { type: Boolean, default: true },
            classReminders: { type: Boolean, default: true },
            paymentAlerts: { type: Boolean, default: true },
            promotionalEmails: { type: Boolean, default: false }
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'private' },
            showAchievements: { type: Boolean, default: true },
            showProgress: { type: Boolean, default: true },
            allowMessaging: { type: Boolean, default: true }
        }
    },
    { timestamps: true }
)

export const UserSettingsModel = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema)
