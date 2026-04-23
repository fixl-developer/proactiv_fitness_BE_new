import { Document, Types } from 'mongoose';

export enum GuardianRelationship {
    PARENT = 'parent',
    MOTHER = 'mother',
    FATHER = 'father',
    GUARDIAN = 'guardian',
    SIBLING = 'sibling',
    GRANDPARENT = 'grandparent',
    UNCLE_AUNT = 'uncle_aunt',
    OTHER = 'other',
}

export enum GuardianLinkStatus {
    PENDING = 'pending',
    LINKED = 'linked',
    REJECTED = 'rejected',
    REMOVED = 'removed',
}

export interface IGuardianLink extends Document {
    studentId: Types.ObjectId;
    guardianId?: Types.ObjectId;        // If guardian is a registered user
    relationship: GuardianRelationship;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    status: GuardianLinkStatus;

    // Guardian details (for non-registered guardians OR cached info)
    guardianName: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianAddress?: string;

    // Invitation tracking
    invitationToken?: string;
    invitationSentAt?: Date;
    invitationExpiresAt?: Date;
    linkedAt?: Date;
    rejectedAt?: Date;

    // Metadata
    notes?: string;
    tenantId?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGuardianLinkCreate {
    guardianId?: string;
    relationship: GuardianRelationship;
    isPrimary?: boolean;
    isEmergencyContact?: boolean;
    guardianName: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianAddress?: string;
    notes?: string;
}

export interface IGuardianLinkUpdate {
    relationship?: GuardianRelationship;
    isPrimary?: boolean;
    isEmergencyContact?: boolean;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianAddress?: string;
    notes?: string;
}
