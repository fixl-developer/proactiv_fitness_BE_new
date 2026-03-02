import { Document } from 'mongoose';

// Deletion Request Interface
export interface IDeletionRequest extends Document {
    requestId: string;
    requestType: 'right_to_delete' | 'enterprise_exit' | 'account_closure' | 'data_cleanup';
    requestedBy: {
        userId: string;
        userName: string;
        userType: string;
        email: string;
    };
    scope: {
        entityType: 'user' | 'student' | 'parent' | 'franchise' | 'location';
        entityId: string;
        entityName: string;
    };
    reason: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
    approvalWorkflow: {
        required: boolean;
        approvers: {
            userId: string;
            userName: string;
            role: string;
            status: 'pending' | 'approved' | 'rejected';
            comments?: string;
            timestamp?: Date;
        }[];
        finalApprover?: string;
        approvedAt?: Date;
    };
    retentionCheck: {
        hasLegalHold: boolean;
        legalHoldReasons?: string[];
        retentionPeriod?: number;
        retentionEndDate?: Date;
        canDelete: boolean;
    };
    dataInventory: {
        category: string;
        recordCount: number;
        dataSize: number;
        location: string;
        canAnonymize: boolean;
        mustRetain: boolean;
        retentionReason?: string;
    }[];
    deletionPlan: {
        totalRecords: number;
        recordsToDelete: number;
        recordsToAnonymize: number;
        recordsToRetain: number;
        estimatedDuration: number;
    };
    execution: {
        startedAt?: Date;
        completedAt?: Date;
        progress: {
            percentage: number;
            currentStep: string;
            recordsProcessed: number;
        };
        errors?: {
            category: string;
            error: string;
            timestamp: Date;
        }[];
    };
    certificate?: {
        certificateId: string;
        certificateUrl: string;
        generatedAt: Date;
        verificationCode: string;
    };
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Retention Policy Interface
export interface IRetentionPolicy extends Document {
    policyId: string;
    policyName: string;
    description: string;
    dataCategory: string;
    retentionPeriod: number;
    retentionUnit: 'days' | 'months' | 'years';
    legalBasis: string;
    jurisdiction: string;
    isActive: boolean;
    exceptions: {
        condition: string;
        extendedPeriod: number;
        reason: string;
    }[];
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
}

// Anonymization Log Interface
export interface IAnonymizationLog extends Document {
    logId: string;
    requestId: string;
    dataCategory: string;
    recordId: string;
    originalData?: any;
    anonymizedData?: any;
    anonymizationMethod: 'hash' | 'mask' | 'generalize' | 'suppress' | 'pseudonymize';
    performedBy: string;
    performedAt: Date;
}

// Deletion Certificate Interface
export interface IDeletionCertificate extends Document {
    certificateId: string;
    requestId: string;
    entityType: string;
    entityId: string;
    entityName: string;
    deletionSummary: {
        totalRecordsDeleted: number;
        totalRecordsAnonymized: number;
        totalRecordsRetained: number;
        categoriesProcessed: string[];
    };
    legalStatement: string;
    verificationCode: string;
    issuedBy: {
        userId: string;
        userName: string;
        role: string;
    };
    issuedAt: Date;
    certificateUrl: string;
}

// Request Interfaces
export interface ICreateDeletionRequest {
    requestType: string;
    scope: {
        entityType: string;
        entityId: string;
        entityName: string;
    };
    reason: string;
}

export interface IApproveDeletionRequest {
    requestId: string;
    approved: boolean;
    comments?: string;
}

export interface IExecuteDeletionRequest {
    requestId: string;
}
