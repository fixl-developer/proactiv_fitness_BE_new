/**
 * Consent Management Interfaces
 * 
 * Defines the data structures for managing consent records and types
 */

export enum ConsentType {
    PHOTO = 'photo',
    VIDEO = 'video',
    PHOTO_VIDEO = 'photo_video',
    MEDICAL = 'medical',
    MARKETING = 'marketing',
    DATA_PROCESSING = 'data_processing',
    THIRD_PARTY_SHARING = 'third_party_sharing',
    ANALYTICS = 'analytics'
}

export interface ConsentRecord {
    id?: string;
    userId: string;
    guardianId?: string;
    consentType: ConsentType;
    status: 'approved' | 'pending' | 'denied' | 'revoked';
    granted?: boolean;
    grantedAt?: Date;
    revokedAt?: Date;
    expiresAt?: Date;
    reason?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConsentRequest {
    userId: string;
    guardianId?: string;
    consentTypes: ConsentType[];
    reason?: string;
    expirationDays?: number;
}

export interface ConsentResponse {
    consentId: string;
    userId: string;
    consentTypes: ConsentType[];
    status: 'approved' | 'pending' | 'denied';
    grantedAt?: Date;
    expiresAt?: Date;
}
