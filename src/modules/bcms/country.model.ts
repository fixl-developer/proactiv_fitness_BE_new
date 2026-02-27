import { Schema, model } from 'mongoose';
import { ICountry } from './bcms.interface';
import { Currency, Language } from '@shared/enums';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const countrySchema = new Schema<ICountry>(
    {
        name: {
            type: String,
            required: [true, 'Country name is required'],
            trim: true,
            unique: true,
        },
        code: {
            type: String,
            required: [true, 'Country code is required'],
            uppercase: true,
            trim: true,
            unique: true,
            minlength: [2, 'Country code must be 2 characters'],
            maxlength: [2, 'Country code must be 2 characters'],
        },
        currency: {
            type: String,
            enum: Object.values(Currency),
            required: [true, 'Currency is required'],
        },
        timezone: {
            type: String,
            required: [true, 'Timezone is required'],
        },
        languages: [
            {
                type: String,
                enum: Object.values(Language),
            },
        ],
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
countrySchema.index({ code: 1 });
countrySchema.index({ isActive: 1 });
countrySchema.index({ name: 1 });

export const Country = model<ICountry>('Country', countrySchema);
