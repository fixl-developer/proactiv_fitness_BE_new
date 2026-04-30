import { Document, Types } from 'mongoose';

export enum WaitlistStatus {
    ACTIVE = 'ACTIVE',
    OFFERED = 'OFFERED',
    ENROLLED = 'ENROLLED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

export enum WaitlistPriority {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

export interface IWaitlistEntry extends Document {
    studentId: Types.ObjectId;
    classId: Types.ObjectId;
    position: number;
    status: WaitlistStatus;
    priority: WaitlistPriority;
    joinedDate: Date;
    offerDate?: Date;
    offerExpiryDate?: Date;
    enrolledDate?: Date;
    notes?: string;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
}

export interface ICreateWaitlistEntryRequest {
    studentId: string;
    classId: string;
    priority?: WaitlistPriority;
    notes?: string;
}

export interface IUpdateWaitlistEntryRequest {
    priority?: WaitlistPriority;
    notes?: string;
}

export interface IWaitlistFilters {
    status?: WaitlistStatus;
    classId?: string;
    priority?: WaitlistPriority;
}