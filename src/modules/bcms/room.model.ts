import { Schema, model } from 'mongoose';
import { IRoom } from './bcms.interface';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const roomSchema = new Schema<IRoom>(
    {
        name: {
            type: String,
            required: [true, 'Room name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Room code is required'],
            uppercase: true,
            trim: true,
        },
        locationId: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            required: [true, 'Location is required'],
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Room type is required'],
            trim: true,
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: [1, 'Capacity must be at least 1'],
        },
        area: {
            type: Number,
            min: [0, 'Area cannot be negative'],
        },
        floor: {
            type: Number,
        },
        description: {
            type: String,
            trim: true,
        },
        equipment: [String],
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
roomSchema.index({ locationId: 1, code: 1 }, { unique: true });
roomSchema.index({ locationId: 1, isActive: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ capacity: 1 });

export const Room = model<IRoom>('Room', roomSchema);
