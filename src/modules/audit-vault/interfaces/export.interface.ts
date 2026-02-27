export interface ExportJob {
    _id?: string;
    jobId: string;
    tenantId: string;
    requestedBy: string;
    requestedAt: Date;

    // Export parameters
    filters: {
        startDate?: Date;
        endDate?: Date;
        categories?: string[];
        actorIds?: string[];
        resourceTypes?: string[];
        searchText?: string;
    };

    format: 'json' | 'csv' | 'pdf';
    includeMetadata: boolean;
    signatureRequired: boolean;

    // Job status
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number; // 0-100

    // Results
    totalRecords?: number;
    exportedRecords?: number;
    filePath?: string;
    fileSize?: number;
    signature?: string;

    // Timing
    startedAt?: Date;
    completedAt?: Date;
    estimatedCompletion?: Date;

    // Error handling
    errorMessage?: string;
    retryCount: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface ExportFilter {
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    actorIds?: string[];
    resourceTypes?: string[];
    tenantIds?: string[];
    searchText?: string;
    includeAnonymized?: boolean;
}

export interface ExportOptions {
    format: 'json' | 'csv' | 'pdf';
    includeMetadata: boolean;
    signatureRequired: boolean;
    maxRecords?: number;
    chunkSize?: number;
}

export interface ExportResult {
    jobId: string;
    status: string;
    filePath?: string;
    fileSize?: number;
    recordCount?: number;
    signature?: string;
    downloadUrl?: string;
}