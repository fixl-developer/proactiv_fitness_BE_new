import { Schema, model } from 'mongoose';
import { IBusinessUnit } from './bcms.interface';
import { BusinessUnitType } from '@shared/enums';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const businessUnitSchema = new Schema<IBusinessUnit>(
    {
        name: {
            type: String,
            required: [true, 'Business unit name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Business unit code is required'],
            uppercase: true,
            trim: true,
            unique: true,
        },
        type: {
            type: String,
            enum: Object.values(BusinessUnitType),
            required: [true, 'Business unit type is required'],
        },
        countryId: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country is required'],
            index: true,
        },
        regionId: {
            type: Schema.Types.ObjectId,
            ref: 'Region',
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        settings: {
            defaultCapacity: {
                type: Number,
                min: 1,
            },
            defaultDuration: {
                type: Number,
                min: 15,
            },
            allowOnlineBooking: {
                type: Boolean,
                default: true,
            },
            requireApproval: {
                type: Boolean,
                default: false,
            },
            cancellationHours: {
                type: Number,
                default: 24,
            },
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        ...baseSchemaFields,
    },
    baseSchemaOptions
);

// Indexes
businessUnitSchema.index({ code: 1 });
businessUnitSchema.index({ countryId: 1, type: 1 });
businessUnitSchema.index({ regionId: 1 });
businessUnitSchema.index({ isActive: 1 });
businessUnitSchema.index({ name: 1 });

export const BusinessUnit = model<IBusinessUnit>('BusinessUnit', businessUnitSchema);
