import { Schema, model, Document } from 'mongoose';

/**
 * Lightweight class record owned by a Location Manager.
 * Decoupled from the heavy `Session` model (which requires
 * programId/termId/scheduleId/duration) so that a manager can
 * spin up a class with just name + coach + schedule.
 */
export interface ILocationClassDoc extends Document {
    name: string;
    level: string;
    coach: string;
    coachId?: string;
    schedule: string;
    capacity: number;
    enrolled: number;
    room?: string;
    status: string;
    locationId?: string;
    businessUnitId?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const locationClassSchema = new Schema<ILocationClassDoc>(
    {
        name: { type: String, required: true, trim: true },
        level: { type: String, default: 'BEGINNER', uppercase: true, trim: true },
        coach: { type: String, default: '', trim: true },
        coachId: { type: String, trim: true },
        schedule: { type: String, default: '', trim: true },
        capacity: { type: Number, default: 20, min: 1, max: 500 },
        enrolled: { type: Number, default: 0, min: 0 },
        room: { type: String, default: '', trim: true },
        status: { type: String, default: 'ACTIVE', uppercase: true, trim: true },
        locationId: { type: String, trim: true },
        businessUnitId: { type: String, trim: true },
        createdBy: { type: String, default: 'system' },
        updatedBy: { type: String, default: 'system' },
    },
    { timestamps: true, collection: 'location_classes' }
);

locationClassSchema.index({ name: 1, locationId: 1 });
locationClassSchema.index({ level: 1, status: 1 });

export const LocationClass = model<ILocationClassDoc>('LocationClass', locationClassSchema);
