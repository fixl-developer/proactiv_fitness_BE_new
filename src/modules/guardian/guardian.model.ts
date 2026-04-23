import { Schema, model } from 'mongoose';
import { IGuardianLink, GuardianRelationship, GuardianLinkStatus } from './guardian.interface';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

const guardianLinkSchema = new Schema<IGuardianLink>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
            index: true,
        },
        guardianId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        relationship: {
            type: String,
            enum: Object.values(GuardianRelationship),
            required: [true, 'Relationship is required'],
        },
        isPrimary: {
            type: Boolean,
            default: false,
        },
        isEmergencyContact: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: Object.values(GuardianLinkStatus),
            default: GuardianLinkStatus.PENDING,
        },

        // Guardian details
        guardianName: {
            type: String,
            required: [true, 'Guardian name is required'],
            trim: true,
            maxlength: [100, 'Guardian name cannot exceed 100 characters'],
        },
        guardianEmail: {
            type: String,
            trim: true,
            lowercase: true,
        },
        guardianPhone: {
            type: String,
            trim: true,
        },
        guardianAddress: {
            type: String,
            trim: true,
        },

        // Invitation tracking
        invitationToken: {
            type: String,
            select: false,
        },
        invitationSentAt: {
            type: Date,
        },
        invitationExpiresAt: {
            type: Date,
        },
        linkedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },

        // Metadata
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        tenantId: {
            type: String,
            index: true,
        },

        ...baseSchemaFields,
    },
    {
        ...baseSchemaOptions,
        timestamps: true,
    }
);

// Indexes
// Unique constraint only when guardianId exists (registered guardians can't be linked twice)
guardianLinkSchema.index(
    { studentId: 1, guardianId: 1 },
    {
        unique: true,
        partialFilterExpression: { guardianId: { $exists: true, $ne: null } },
    }
);
guardianLinkSchema.index({ studentId: 1, status: 1 });
guardianLinkSchema.index({ guardianId: 1, status: 1 });
guardianLinkSchema.index({ guardianEmail: 1 });
guardianLinkSchema.index({ invitationToken: 1 }, { sparse: true });

export const GuardianLink = model<IGuardianLink>('GuardianLink', guardianLinkSchema);
