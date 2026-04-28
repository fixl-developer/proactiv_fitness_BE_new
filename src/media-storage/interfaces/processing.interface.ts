/**
 * Media Processing Interfaces
 * 
 * Defines the data structures for media processing jobs and status
 */

export enum ProcessingJobType {
    THUMBNAIL = 'thumbnail',
    THUMBNAIL_GENERATION = 'thumbnail_generation',
    VIRUS_SCAN = 'virus_scan',
    FACE_BLUR = 'face_blur',
    FACE_DETECTION = 'face_detection',
    METADATA_EXTRACTION = 'metadata_extraction',
    COMPRESSION = 'compression',
    FORMAT_CONVERSION = 'format_conversion'
}

export enum ProcessingStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export interface ProcessingJob {
    jobId: string;
    fileId: string;
    jobType: ProcessingJobType;
    status: ProcessingStatus;
    priority?: number;
    retryCount?: number;
    maxRetries?: number;
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    result?: any;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProcessingQueue {
    queueId: string;
    jobs: string[]; // Array of job IDs
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProcessingResult {
    jobId: string;
    fileId: string;
    success: boolean;
    result?: any;
    error?: string;
    processingTimeMs: number;
    timestamp: Date;
}
