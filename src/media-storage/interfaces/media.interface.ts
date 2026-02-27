/**
 * Media Storage Module - Core Interfaces
 * 
 * Defines the data structures for the media and document storage system
 * supporting consent-aware access, versioning, collections, and secure operations.
 */

export enum MediaCategory {
    CHILD_PHOTO = 'child_photo',
    CHILD_VIDEO = 'child_video',
    SKILL_EVIDENCE = 'skill_evidence',
    INCIDENT_REPORT = 'incident_report',
    CERTIFICATION = 'certification',
    LEGAL_DOCUMENT = 'legal_document',
    MARKETING_MATERIAL = 'marketing_material'
}

export enum ConsentState {
    APPROVED = 'approved',
    PENDING = 'pending',
    DENIED = 'denied',
    REVOKED = 'revoked'
}

export enum StorageProvider {
    S3 = 's3',
    LOCAL = 'local'
}

export enum AccessLevel {
    PUBLIC = 'public',
    PRIVATE = 'private',
    RESTRICTED = 'restricted'
}

export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export interface MediaMetadata {
    title?: string;
    description?: string;
    tags: string[];
    customFields: Record<string, any>;
    uploadedBy: string;
    uploadedAt: Date;
    lastModifiedBy?: string;
    lastModifiedAt?: Date;
}

export interface ConsentStatus {
    state: ConsentState;
    grantedBy?: string;
    grantedAt?: Date;
    revokedBy?: string;
    revokedAt?: Date;
    reason?: string;
    expiresAt?: Date;
}

export interface ThumbnailInfo {
    small: string; // 150px
    medium: string; // 300px
    large: string; // 600px
}

export interface MediaFile {
    id: string;
    filename: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    category: MediaCategory;
    accessLevel: AccessLevel;

    // Storage information
    storageProvider: StorageProvider;
    storagePath: string;
    storageKey: string;

    // Tenant context
    tenantId: string;
    countryId?: string;
    regionId?: string;
    businessUnitId?: string;
    locationId?: string;

    // Metadata
    metadata: MediaMetadata;

    // Consent (for child media)
    consentStatus?: ConsentStatus;

    // Thumbnails
    thumbnails?: ThumbnailInfo;

    // Face blur information
    hasBlurredVersion?: boolean;
    blurredStorageKey?: string;

    // Versioning
    version: number;
    isLatestVersion: boolean;
    parentFileId?: string; // For document versions

    // Soft deletion
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string;
    deletionReason?: string;
    permanentDeletionAt?: Date;

    // Audit fields
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentVersion {
    versionId: string;
    fileId: string;
    version: number;
    filename: string;
    fileSize: number;
    storageKey: string;
    uploadedBy: string;
    uploadedAt: Date;
    changeDescription?: string;
    isActive: boolean;
}

export interface MediaCollection {
    id: string;
    name: string;
    description?: string;
    tenantId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    mediaFiles: string[]; // Array of media file IDs
    sharedUrl?: string;
    sharedUrlExpiresAt?: Date;
    isDeleted: boolean;
}

export interface UploadSession {
    sessionId: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    category: MediaCategory;
    tenantId: string;
    uploadedBy: string;
    status: UploadStatus;
    uploadedBytes: number;
    totalBytes: number;
    uploadUrl?: string; // For direct uploads
    storageKey?: string;
    createdAt: Date;
    expiresAt: Date;
    completedAt?: Date;
    errorMessage?: string;
}

export interface StorageQuota {
    tenantId: string;
    hierarchyLevel: 'country' | 'region' | 'business_unit' | 'location';
    quotaBytes: number;
    usedBytes: number;
    temporaryIncreaseBytes?: number;
    temporaryIncreaseExpiresAt?: Date;
    lastUpdated: Date;
}

export interface SignedUrlRequest {
    fileId: string;
    expirationMinutes?: number;
    downloadFilename?: string;
    contentDisposition?: 'inline' | 'attachment';
}

export interface SignedUrlResponse {
    url: string;
    expiresAt: Date;
    headers?: Record<string, string>;
}

export interface MediaSearchFilters {
    tenantId?: string;
    category?: MediaCategory;
    tags?: string[];
    uploadedBy?: string;
    uploadedAfter?: Date;
    uploadedBefore?: Date;
    consentState?: ConsentState;
    accessLevel?: AccessLevel;
    isDeleted?: boolean;
    hasConsent?: boolean;
}

export interface MediaUploadRequest {
    filename: string;
    mimeType: string;
    fileSize: number;
    category: MediaCategory;
    accessLevel?: AccessLevel;
    metadata?: Partial<MediaMetadata>;
    consentRequired?: boolean;
    generateThumbnails?: boolean;
    enableFaceBlur?: boolean;
}

export interface MediaUploadResponse {
    fileId: string;
    uploadUrl?: string; // For direct uploads
    sessionId?: string; // For resumable uploads
    requiresConsent: boolean;
}

export interface VirusScanResult {
    isClean: boolean;
    threatName?: string;
    scanDate: Date;
    scanEngine: string;
}

export interface FaceDetectionResult {
    facesDetected: number;
    faceCoordinates: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    blurredImageKey?: string;
}

export interface MediaProcessingJob {
    jobId: string;
    fileId: string;
    jobType: 'thumbnail' | 'virus_scan' | 'face_blur';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    result?: any;
}

export interface MediaAuditEvent {
    eventId: string;
    eventType: 'upload' | 'download' | 'access' | 'delete' | 'consent_change' | 'metadata_update';
    fileId: string;
    tenantId: string;
    userId: string;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

export interface MediaStatistics {
    totalFiles: number;
    totalSizeBytes: number;
    filesByCategory: Record<MediaCategory, number>;
    filesByConsentState: Record<ConsentState, number>;
    uploadsByMonth: Array<{
        month: string;
        count: number;
        sizeBytes: number;
    }>;
    topUploaders: Array<{
        userId: string;
        count: number;
        sizeBytes: number;
    }>;
}