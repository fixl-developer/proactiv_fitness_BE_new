import { Schema, model, Document, Types } from 'mongoose';
import { WaitlistStatus, WaitlistPriority } from './waitlist.interface';

export interface IWaitlistEntryDocument extends Document {
    studentId: Types.ObjectId;
    classId: Types.ObjectId;
    locationId?: Types.ObjectId;
    position: number;
    status: WaitlistStatus;
    priority: WaitlistPriority;
    joinedDate: Date;
    offerDate?: Date;
    offerExpiryDate?: Date;
    enrolledDate?: Date;
    rejectionDate?: Date;
    rejectionReason?: string;
    notes?: string;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const waitlistEntrySchema = new Schema<IWaitlistEntryDocument>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        classId: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        },
        locationId: {
            type: Schema.Types.ObjectId,
            ref: 'Location'
        },
        position: {
            type: Number,
            required: true,
            min: 1
        },
        status: {
            type: String,
            enum: Object.values(WaitlistStatus),
            default: WaitlistStatus.ACTIVE
        },
        priority: {
            type: String,
            enum: Object.values(WaitlistPriority),
            default: WaitlistPriority.MEDIUM
        },
        joinedDate: {
            type: Date,
            required: true
        },
        offerDate: Date,
        offerExpiryDate: Date,
        enrolledDate: Date,
        rejectionDate: Date,
        rejectionReason: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        businessUnitId: {
            type: String,
            required: true
        },
        createdBy: {
            type: String,
            required: true
        },
        updatedBy: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes
waitlistEntrySchema.index({ classId: 1, position: 1 });
waitlistEntrySchema.index({ businessUnitId: 1, status: 1 });
waitlistEntrySchema.index({ studentId: 1 });

export const WaitlistEntry = model<IWaitlistEntryDocument>('WaitlistEntry', waitlistEntrySchema);

export class WaitlistEntryClass extends Document {
    studentId: Types.ObjectId;
    classId: Types.ObjectId;
    locationId?: Types.ObjectId;
    position: number;
    status: WaitlistStatus;
    priority: WaitlistPriority;
    joinedDate: Date;
    offerDate?: Date;
    offerExpiryDate?: Date;
    enrolledDate?: Date;
    rejectionDate?: Date;
    rejectionReason?: string;
    notes?: string;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
}
