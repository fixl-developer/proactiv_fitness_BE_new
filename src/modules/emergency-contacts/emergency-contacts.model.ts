import { Schema, model, Document, Types } from 'mongoose';
import { EmergencyContactStatus, IEmergencyContact } from './emergency-contacts.interface';

const EmergencyContactSchema = new Schema<IEmergencyContact>(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        contactName: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        primaryPhone: { type: String, required: true, trim: true },
        alternatePhone: { type: String, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        address: { type: String, required: true, trim: true },
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
        businessUnitId: { type: String, required: true },
        createdBy: { type: String, required: true },
        updatedBy: { type: String, required: true }
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
