import { Schema, model } from 'mongoose';
import { LocationDailyStats } from '../interfaces';
import { COLLECTIONS } from '../constants';

const programStatsSchema = new Schema(
    {
        programId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        bookings: {
            type: Number,
            required: true,
            default: 0,
        },
        revenue: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { _id: false }
);

const locationDailyStatsSchema = new Schema<LocationDailyStats>(
    {
        locationId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        totalBookings: {
            type: Number,
            required: true,
            default: 0,
        },
        totalRevenue: {
            type: Number,
            required: true,
            default: 0,
        },
        totalAttendance: {
            type: Number,
            required: true,
            default: 0,
        },
        averageOccupancy: {
            type: Number,
            required: true,
            default: 0,
        },
        programStats: [programStatsSchema],
        lastUpdated: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: COLLECTIONS.LOCATION_DAILY_STATS,
    }
);

// Compound indexes for analytics queries
locationDailyStatsSchema.index({ locationId: 1, date: -1 });
locationDailyStatsSchema.index({ date: 1, locationId: 1 });

// Unique constraint on location + date
locationDailyStatsSchema.index({ locationId: 1, date: 1 }, { unique: true });

export const LocationDailyStatsModel = model<LocationDailyStats>(
    COLLECTIONS.LOCATION_DAILY_STATS,
    locationDailyStatsSchema
);
