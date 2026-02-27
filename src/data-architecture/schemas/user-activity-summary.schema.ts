import { Schema, model } from 'mongoose';
import { UserActivitySummary } from '../interfaces';
import { COLLECTIONS } from '../constants';

const userActivitySummarySchema = new Schema<UserActivitySummary>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        month: {
            type: Date,
            required: true,
            index: true,
        },
        totalBookings: {
            type: Number,
            required: true,
            default: 0,
        },
        totalSpent: {
            type: Number,
            required: true,
            default: 0,
        },
        attendanceRate: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100,
        },
        favoritePrograms: [
            {
                type: Schema.Types.ObjectId,
                ref: 'programs',
            },
        ],
        lastUpdated: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: COLLECTIONS.USER_ACTIVITY_SUMMARY,
    }
);

// Compound indexes
userActivitySummarySchema.index({ userId: 1, month: -1 });
userActivitySummarySchema.index({ month: 1, userId: 1 });

// Unique constraint on user + month
userActivitySummarySchema.index({ userId: 1, month: 1 }, { unique: true });

export const UserActivitySummaryModel = model<UserActivitySummary>(
    COLLECTIONS.USER_ACTIVITY_SUMMARY,
    userActivitySummarySchema
);
