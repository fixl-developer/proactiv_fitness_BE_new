import { Schema, model } from 'mongoose';
import { IHolidayCalendar } from './bcms.interface';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const holidaySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        affectsScheduling: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const holidayCalendarSchema = new Schema<IHolidayCalendar>(
    {
        name: {
            type: String,
            required: [true, 'Calendar name is required'],
            trim: true,
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [2020, 'Year must be 2020 or later'],
            max: [2100, 'Year must be 2100 or earlier'],
        },
        // @ts-ignore - Mongoose type issue
        countryId: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country is required'],
            index: true,
        },
        // @ts-ignore - Mongoose type issue
        regionId: {
            type: Schema.Types.ObjectId,
            ref: 'Region',
            index: true,
        },
        holidays: [holidaySchema],
        isActive: {
            type: Boolean,
            default: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        ...baseSchemaFields,
    },
    baseSchemaOptions
);

// Indexes
holidayCalendarSchema.index({ countryId: 1, year: 1 });
holidayCalendarSchema.index({ regionId: 1, year: 1 });
holidayCalendarSchema.index({ year: 1, isActive: 1 });

export const HolidayCalendar = model<IHolidayCalendar>('HolidayCalendar', holidayCalendarSchema);
