import { Schema, model } from 'mongoose';
import { IRegion } from './bcms.interface';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const regionSchema = new Schema<IRegion>(
    {
        name: {
            type: String,
            required: [true, 'Region name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Region code is required'],
            uppercase: true,
            trim: true,
        },
        countryId: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country is required'],
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
        metadata: {
            type: Schema.Types.Mixed,
        },
        ...baseSchemaFields,
    },
    baseSchemaOptions
);

// Indexes
regionSchema.index({ countryId: 1, code: 1 }, { unique: true });
regionSchema.index({ countryId: 1, isActive: 1 });
regionSchema.index({ name: 1 });

export const Region = model<IRegion>('Region', regionSchema);
