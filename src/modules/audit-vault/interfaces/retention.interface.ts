export interface RetentionPolicy {
    _id?: string;
    policyId: string;
    tenantId?: string; // null for platform-wide policies

    name: string;
    description: string;
    category: string;

    // Retention rules
    retentionPeriod: number; // in days
    archivalPeriod?: number; // in days
    deletionPeriod?: number; // in days

    // Conditions
    conditions: {
        categories?: string[];
        resourceTypes?: string[];
        severities?: string[];
        customRules?: Record<string, any>;
    };

    // Legal hold support
    respectsLegalHold: boolean;

    // Status
    isActive: boolean;
    priority: number; // Higher number = higher priority

    // Metadata
    createdBy: string;
    approvedBy?: string;
    version: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface LegalHold {
    _id?: string;
    holdId: string;
    tenantId: string;

    name: string;
    description: string;
    reason: string;

    // Legal details
    caseNumber?: string;
    courtOrder?: string;
    legalCounsel: string;

    // Scope
    scope: {
        startDate?: Date;
        endDate?: Date;
        categories?: string[];
        resourceTypes?: string[];
        actorIds?: string[];
        resourceIds?: string[];
        customFilters?: Record<string, any>;
    };

    // Status
    status: 'active' | 'released' | 'expired';
    isActive: boolean;

    // Dates
    effectiveDate: Date;
    expiryDate?: Date;
    releasedDate?: Date;

    // Metadata
    createdBy: string;
    releasedBy?: string;
    releaseReason?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface RetentionEligibility {
    logId: string;
    eligible: boolean;
    reason: string;
    eligibleDate?: Date;
    legalHolds: string[];
    applicablePolicies: string[];
}