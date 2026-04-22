import { Schema, model, Document, Types } from 'mongoose';
import { EmergencyContactStatus } from './emergency-contacts.interface';

export interface IEmergencyContactDocument extends Document {
    studentId: Types.ObjectId;
    contactName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone?: string;
    email: string;
    address: string;
    isAuthorizedPickup: boolean;
    medicalInfo?: string;
    status: EmergencyContactStatus;
    verifiedDate?: Date;
    verifiedBy?: string;
    notes?: string;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const emergencyContactSchema = new Schema<IEmergencyContactDocument>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        contactName: {
            type: String,
            required: true,
            trim: true
        },
        relationship: {
            type: String,
            required: true,
            trim: true
        },
        primaryPhone: {
            type: String,
            required: true,
            trim: true
        },
        alternatePhone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        isAuthorizedPickup: {
            type: Boolean,
            default: false
        },
        medicalInfo: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: Object.values(EmergencyContactStatus),
            default: EmergencyContactStatus.PENDING
        },
        verifiedDate: Date,
        verifiedBy: String,
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
    { timestamps: true }
);

// Indexes
emergencyContactSchema.index({ studentId: 1 });
emergencyContactSchema.index({ businessUnitId: 1, status: 1 });
emergencyContactSchema.index({ primaryPhone: 1 });
emergencyContactSchema.index({ email: 1 });

export const EmergencyContact = model<IEmergencyContactDocument>('EmergencyContact', emergencyContactSchema);