import { Document } from 'mongoose';

// Export Pack Interface
export interface IExportPack extends Document {
    exportId: string;
    exportType: 'parent_level' | 'franchise_level' | 'location_level' | 'custom';
    requestedBy: {
        userId: string;
        userName: string;
        userType: string;
        email: string;
    };
    scope: {
        entityType: 'parent' | 'student' | 'franchise' | 'location' | 'business_unit';
        entityId: string;
        entityName: string;
    };
    dataCategories: {
        category: string;
        included: boolean;
        recordCount?: number;
    }[];
    format: 'pdf' | 'csv' | 'json' | 'excel' | 'zip';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    progress: {
        percentage: number;
        currentStep: string;
        estimatedCompletion?: Date;
    };
    files: {
        fileName: string;
        fileUrl: string;
        fileSize: number;
        format: string;
        generatedAt: Date;
    }[];
    metadata: {
        totalRecords: number;
        totalSize: number;
        dateRange?: {
            from: Date;
            to: Date;
        };
        includeArchived: boolean;
    };
    schedule?: {
        isScheduled: boolean;
        frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
        nextRun?: Date;
        lastRun?: Date;
    };
    expiryDate: Date;
    downloadCount: number;
    lastDownloadedAt?: Date;
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Export Template Interface
export interface IExportTemplate extends Document {
    templateId: string;
    templateName: string;
    description: string;
    exportType: string;
    dataCategories: string[];
    format: string;
    isDefault: boolean;
    isActive: boolean;
    usageCount: number;
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
}

// Export History Interface
export interface IExportHistory extends Document {
    historyId: string;
    exportId: string;
    action: 'created' | 'started' | 'completed' | 'failed' | 'downloaded' | 'expired' | 'deleted';
    performedBy: string;
    details?: string;
    timestamp: Date;
}

// Request Interfaces
export interface ICreateExportRequest {
    exportType: string;
    scope: {
        entityType: string;
        entityId: string;
        entityName: string;
    };
    dataCategories: string[];
    format: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    includeArchived?: boolean;
    schedule?: {
        isScheduled: boolean;
        frequency?: string;
    };
}

export interface IParentExportRequest {
    parentId: string;
    studentIds?: string[];
    categories: ('passport' | 'incidents' | 'consents' | 'attendance' | 'payments' | 'documents' | 'communications')[];
    format: 'pdf' | 'csv' | 'json' | 'zip';
    dateRange?: {
        from: Date;
        to: Date;
    };
}

export interface IFranchiseExportRequest {
    franchiseId: string;
    categories: ('financial' | 'operations' | 'students' | 'staff' | 'compliance' | 'reports')[];
    format: 'excel' | 'csv' | 'json' | 'zip';
    dateRange: {
        from: Date;
        to: Date;
    };
}

export interface IScheduleExportRequest {
    exportId: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    startDate: Date;
}
