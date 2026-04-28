import { Schema, model, Types } from 'mongoose';
import { IWaitlistEntry, WaitlistStatus, WaitlistPriority } from './waitlist.interface';
import { baseSchemaOptions } from '../../shared/base/base.model';

const waitlistEntrySchema = new Schema<IWaitlistEntry>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        classId: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        },
        position: {
            type: Number,
            required: true,
            min: 1,
        },
        status: {
            type: String,
            enum: Object.values(WaitlistStatus),
            default: WaitlistStatus.ACTIVE,
        },
        priority: {
            type: String,
            enum: Object.values(WaitlistPriority),
            default: WaitlistPriority.MEDIUM,
        },
        joinedDate: {
            type: Date,
            required: true,
        },
        offerDate: { type: Date },
        offerExpiryDate: { type: Date },
        enrolledDate: { type: Date },
        notes: { type: String, trim: true },
        businessUnitId: { type: String, required: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true },
    },
    baseSchemaOptions
);

// Indexes
waitlistEntrySchema.index({ classId: 1, position: 1 });
waitlistEntrySchema.index({ businessUnitId: 1, status: 1 });
waitlistEntrySchema.index({ studentId: 1 });

export const WaitlistEntry = model<IWaitlistEntry>('WaitlistEntry', waitlistEntrySchema);

// Backwards-compatible export
export const WaitlistEntrySchema = waitlistEntrySchema;
