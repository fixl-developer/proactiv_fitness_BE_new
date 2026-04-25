import { Types } from 'mongoose';

export interface AuditLog {
    _id?: Types.ObjectId;

    // Unique log identifier (UUID)
    logId?: string;

    // Tenant context
    tenantId: string;
    countryId?: string;
    regionId?: string;
    businessUnitId?: string;
    locationId?: string;

    // Core audit fields
    timestamp: Date;
    timestampNanos?: number;
    sequenceNumber: number;
    previousHash?: string;
    currentHash: string;

    // Actor information
    actorId: string;
    actorType: 'user' | 'system' | 'api' | 'admin';
    actorEmail?: string;
    actorName?: string;

    // Action information
    actionType: string;
    actionCategory?: string;
    category?: AuditCategory;
    severity?: AuditSeverity;

    // Resource information
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;

    // Context and metadata
    context: Record<string, any>;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
        requestId?: string;
        source: string;
        version: string;
    };

    // Request context (top-level convenience fields)
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;

    // Impersonation context
    impersonation?: {
        adminId: string;
        adminEmail: string;
        reason: string;
        sessionId: string;
    };

    // Change tracking
    changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
        fields: string[];
    };

    // Compliance flags
    retentionCategory?: string;
    legalHoldFlag?: boolean;
    legalHolds?: string[];
    anonymized?: boolean;
    immutable?: boolean;

    createdAt: Date;
    updatedAt?: Date;
}

export enum AuditCategory {
    CONSENT = 'consent',
    CUSTODY = 'custody',
    FINANCIAL = 'financial',
    CERTIFICATION = 'certification',
    AUTOMATION = 'automation',
    IMPERSONATION = 'impersonation',
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    DATA_ACCESS = 'data_access',
    SYSTEM = 'system'
}

export enum AuditSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// Specialized log types
export interface ConsentLog extends AuditLog {
    category: AuditCategory.CONSENT;
    context: {
        consentType: 'marketing' | 'data_processing' | 'photo_video' | 'medical';
        granted: boolean;
        guardianId?: string;
        guardianName?: string;
        minorId?: string;
        minorName?: string;
        expiryDate?: Date;
        purpose: string;
        dataCategories: string[];
    };
}

export interface CustodyLog extends AuditLog {
    category: AuditCategory.CUSTODY;
    context: {
        minorId: string;
        minorName: string;
        guardianId: string;
        guardianName: string;
        custodyType: 'primary' | 'secondary' | 'emergency';
        relationship: string;
        effectiveDate: Date;
        expiryDate?: Date;
        courtOrderNumber?: string;
        disputeFlag: boolean;
    };
}

export interface FinancialLog extends AuditLog {
    category: AuditCategory.FINANCIAL;
    context: {
        transactionId: string;
        transactionType: 'payment' | 'refund' | 'adjustment' | 'credit' | 'dispute';
        amount: number;
        currency: string;
        paymentMethod?: string;
        reason?: string;
        approvedBy?: string;
        originalTransactionId?: string;
    };
}

export interface CertificationLog extends AuditLog {
    category: AuditCategory.CERTIFICATION;
    context: {
        certificationType: string;
        certificationBody: string;
        certificateNumber: string;
        issuedDate: Date;
        expiryDate: Date;
        status: 'active' | 'expired' | 'revoked' | 'suspended';
        revokedBy?: string;
        revokedReason?: string;
    };
}

export interface AutomationLog extends AuditLog {
    category: AuditCategory.AUTOMATION;
    context: {
        ruleId: string;
        ruleName: string;
        ruleVersion: string;
        triggerEvent: string;
        conditions: Record<string, any>;
        actions: string[];
        executionTime: number;
        success: boolean;
        errorMessage?: string;
    };
}

export interface ImpersonationLog extends AuditLog {
    category: AuditCategory.IMPERSONATION;
    context: {
        targetUserId: string;
        targetUserEmail: string;
        targetUserName: string;
        sessionId: string;
        sessionStartTime: Date;
        sessionEndTime?: Date;
        sessionDuration?: number;
        reason: string;
        approvedBy?: string;
        actionsPerformed: string[];
    };
}