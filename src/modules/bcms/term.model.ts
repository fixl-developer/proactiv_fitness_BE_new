import { Schema, model } from 'mongoose';
import { ITerm } from './bcms.interface';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const termSchema = new Schema<ITerm>(
    {
        name: {
            type: String,
            required: [true, 'Term name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Term code is required'],
            uppercase: true,
            trim: true,
        },
        // @ts-ignore - Mongoose type issue
        businessUnitId: {
            type: Schema.Types.ObjectId,
            ref: 'BusinessUnit',
            required: [true, 'Business unit is required'],
            index: true,
        },
        // @ts-ignore - Mongoose type issue
        locationId: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            index: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        registrationStartDate: {
            type: Date,
        },
        registrationEndDate: {
            type: Date,
        },
        weeks: {
            type: Number,
            required: true,
            min: [1, 'Term must be at least 1 week'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        allowEnrollment: {
            type: Boolean,
            default: true,
        },
        // @ts-ignore - Mongoose type issue
        holidayCalendarId: {
            type: Schema.Types.ObjectId,
            ref: 'HolidayCalendar',
        },
        excludedDates: [Date],
        pricingMultiplier: {
            type: Number,
            default: 1.0,
            min: [0.1, 'Pricing multiplier must be at least 0.1'],
            max: [10, 'Pricing multiplier cannot exceed 10'],
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        ...baseSchemaFields,
    },
    baseSchemaOptions
);

// Pre-save middleware to calculate weeks
termSchema.pre('save', function (next) {
    const term = this as any;
    if (term.isModified('startDate') || term.isModified('endDate')) {
        const diffTime = Math.abs(term.endDate.getTime() - term.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        term.weeks = Math.ceil(diffDays / 7);
    }
    next();
});

// Indexes
termSchema.index({ businessUnitId: 1, code: 1 }, { unique: true });
termSchema.index({ businessUnitId: 1, isActive: 1 });
termSchema.index({ locationId: 1 });
termSchema.index({ startDate: 1, endDate: 1 });
termSchema.index({ isActive: 1, allowEnrollment: 1 });

export const Term = model<ITerm>('Term', termSchema);
