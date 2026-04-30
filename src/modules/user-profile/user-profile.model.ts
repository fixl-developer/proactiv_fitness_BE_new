import { Schema, model, Document } from 'mongoose';
import { IUserProfile } from './user-profile.interface';

const UserProfileSchema = new Schema<IUserProfile & Document>(
    {
        userId: { type: String, required: true, unique: true, index: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        avatar: { type: String },
        bio: { type: String, maxlength: 500 },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
        },
        preferences: {
            language: { type: String, default: 'en' },
            timezone: { type: String, default: 'UTC' },
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: false },
                push: { type: Boolean, default: true }
            }
        },
        stats: {
            totalClasses: { type: Number, default: 0 },
            totalSpent: { type: Number, default: 0 },
            memberSince: { type: Date, default: Date.now },
            lastActive: { type: Date, default: Date.now }
        }
    },
    {
        timestamps: true,
        collection: 'user_profiles'
    }
);

// Indexes
UserProfileSchema.index({ userId: 1 });
UserProfileSchema.index({ email: 1 });

export const UserProfileModel = model<IUserProfile & Document>('UserProfile', UserProfileSchema);
