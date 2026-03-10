import { Schema, model } from 'mongoose';
import { ILocation } from './bcms.interface';
import { LocationStatus } from '@shared/enums';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const locationSchema = new Schema<ILocation>(
    {
        name: {
            type: String,
            required: [true, 'Location name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Location code is required'],
            uppercase: true,
            trim: true,
            unique: true,
        },
        // @ts-ignore - Mongoose type issue
        businessUnitId: {
            type: Schema.Types.ObjectId,
            ref: 'BusinessUnit',
            required: [true, 'Business unit is required'],
            index: true,
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
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: String,
            country: { type: String, required: true },
            postalCode: { type: String, required: true },
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        contactInfo: {
            email: String,
            phone: String,
            alternatePhone: String,
            emergencyContact: {
                name: String,
                relationship: String,
                phone: String,
            },
        },
        status: {
            type: String,
            enum: Object.values(LocationStatus),
            default: LocationStatus.ACTIVE,
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: [1, 'Capacity must be at least 1'],
        },
        operatingHours: {
            type: Map,
            of: {
                isOpen: { type: Boolean, default: false },
                openTime: String,
                closeTime: String,
            },
        },
        facilities: [String],
        amenities: [String],
        images: [String],
        coverImage: String,
        settings: {
            allowOnlineBooking: {
                type: Boolean,
                default: true,
            },
            requireApproval: {
                type: Boolean,
                default: false,
            },
            autoConfirm: {
                type: Boolean,
                default: true,
            },
            maxAdvanceBookingDays: {
                type: Number,
                default: 30,
            },
            minAdvanceBookingHours: {
                type: Number,
                default: 2,
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
locationSchema.index({ code: 1 });
locationSchema.index({ businessUnitId: 1, status: 1 });
locationSchema.index({ countryId: 1 });
locationSchema.index({ regionId: 1 });
locationSchema.index({ status: 1 });
locationSchema.index({ name: 1 });
locationSchema.index({ 'address.city': 1 });

export const Location = model<ILocation>('Location', locationSchema);
