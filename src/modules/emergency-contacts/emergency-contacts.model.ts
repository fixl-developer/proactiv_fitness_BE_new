import { Schema, model, Document, Types } from 'mongoose';
import { EmergencyContactStatus, IEmergencyContact } from './emergency-contacts.interface';

const EmergencyContactSchema = new Schema<IEmergencyContact>(
    {
        // studentId is optional for location-manager standalone contacts;
        // strict validation lives at the API layer for student-linked uses.
        studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
        contactName: { type: String, required: true, trim: true },
        relationship: { type: String, default: '', trim: true },
        primaryPhone: { type: String, required: true, trim: true },
        alternatePhone: { type: String, trim: true },
        email: { type: String, default: '', trim: true, lowercase: true },
        address: { type: String, default: '', trim: true },
        isAuthorizedPickup: { type: Boolean, default: false },
        medicalInfo: { type: String, trim: true },
        status: {
            type: String,
            enum: Object.values(EmergencyContactStatus),
            default: EmergencyContactStatus.PENDING
        },
        verifiedDate: { type: Date },
        verifiedBy: { type: String },
        notes: { type: String, trim: true },
        businessUnitId: { type: String, default: 'default' },
        createdBy: { type: String, default: 'system' },
        updatedBy: { type: String, default: 'system' }
    },
    { timestamps: true }
);

// Indexes
EmergencyContactSchema.index({ studentId: 1 });
EmergencyContactSchema.index({ businessUnitId: 1, status: 1 });
EmergencyContactSchema.index({ primaryPhone: 1 });
EmergencyContactSchema.index({ email: 1 });

export const EmergencyContact = model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
export { EmergencyContactSchema };
