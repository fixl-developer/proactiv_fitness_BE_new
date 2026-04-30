import { Document, Types } from 'mongoose';

export enum EmergencyContactStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    EXPIRED = 'EXPIRED',
    INACTIVE = 'INACTIVE'
}

export interface IEmergencyContact extends Document {
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
}

export interface ICreateEmergencyContactRequest {
    studentId: string;
    contactName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone?: string;
    email: string;
    address: string;
    isAuthorizedPickup?: boolean;
    medicalInfo?: string;
    notes?: string;
}

export interface IUpdateEmergencyContactRequest {
    contactName?: string;
    relationship?: string;
    primaryPhone?: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    isAuthorizedPickup?: boolean;
    medicalInfo?: string;
    notes?: string;
}

export interface IEmergencyContactFilters {
    status?: EmergencyContactStatus;
    studentId?: string;
    isAuthorizedPickup?: boolean;
}