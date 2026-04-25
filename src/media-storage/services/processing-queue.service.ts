import { Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ProcessingJobType, ProcessingStatus } from '../interfaces';
import logger from '../../shared/utils/logger.util';

export interface QueueJobOptions {
    jobType: ProcessingJobType | string;
    fileId: string;
    tenantId: string;
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
    retryCount?: number;
    maxRetries?: number;
}

export interface ProcessingJob {
    _id?: any;
    jobId: string;
    jobType: string;
    fileId: string;
    tenantId: string;
    status: ProcessingStatus;
    priority: 'low' | 'medium' | 'high';
    progress: number;
    metadata: any;
    retryCount: number;
    maxRetries: number;
    error?: string;
    result?: any;
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

/**
 * Processing Queue Service for background jobs
 */
export class ProcessingQueueService {
    private db: Db;
    private collection: any;
    private isProcessing: boolean = false;
    private processingInterval: NodeJS.Timeout | null = null;

    constructor(db: Db) {
        this.db = db;
        this.collection = db.collection('processing_jobs');
        this.startProcessing();
    }

    /**
     * Queue a processing job
     */
    async queueJob(options: QueueJobOptions): Promise<string> {
        const jobId = uuidv4();
        const now = new Date();

        const job: ProcessingJob = {
            jobId,
            jobType: options.jobType,
            fileId: options.fileId,
            tenantId: options.tenantId,
            status: ProcessingStatus.PENDING,
            priority: options.priority || 'medium',
            progress: 0,
            metadata: options.metadata || {},
            retryCount: 0,
            maxRetries: options.maxRetries || 3,
            createdAt: now,
            updatedAt: now,
        };

        await this.collection.insertOne(job);

        logger.debug('Job queued', {
            jobId,
            jobType: options.jobType,
            fileId: options.fileId,
            priority: job.priority
        });

        return jobId;
    }

    /**
     * Get job status
     */
    async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
        return this.collection.findOne({ jobId });
    }

    /**
     * Update job progress
     */
    async updateJobProgress(
        jobId: string,
        progress: number,
        status?: ProcessingStatus
    ): Promise<void> {
        const update: any = {
            progress: Math.max(0, Math.min(100, progress)),
            updatedAt: new Date()
        };

        if (status) {
            update.status = status;
            if (status === ProcessingStatus.PROCESSING && !update.startedAt) {
                update.startedAt = new Date();
            }
            if (status === ProcessingStatus.COMPLETED || status === ProcessingStatus.FAILED) {
                update.completedAt = new Date();
            }
        }

        await this.collection.updateOne({ jobId }, { $set: update });
    }

    /**
     * Complete job with result
     */
    async completeJob(jobId: string, result: any): Promise<void> {
        await this.collection.updateOne(
            { jobId },
            {
                $set: {
                    status: ProcessingStatus.COMPLETED,
                    progress: 100,
                    result,
                    completedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        logger.debug('Job completed', { jobId });
    }

    /**
     * Fail job with error
     */
    async failJob(jobId: string, error: string): Promise<void> {
        const job = await this.getJobStatus(jobId);
        if (!job) return;

        const shouldRetry = job.retryCount < job.maxRetries;

        if (shouldRetry) {
            // Retry the job
            await this.collection.updateOne(
                { jobId },
                {
                    $set: {
                        status: ProcessingStatus.PENDING,
                        error,
                        updatedAt: new Date()
                    },
                    $inc: { retryCount: 1 }
                }
            );

            logger.warn('Job failed, will retry', {
                jobId,
                retryCount: job.retryCount + 1,
                maxRetries: job.maxRetries,
                error
            });
        } else {
            // Mark as permanently failed
            await this.collection.updateOne(
                { jobId },
                {
                    $set: {
                        status: ProcessingStatus.FAILED,
                        error,
                        completedAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );

            logger.error('Job permanently failed', {
                jobId,
                retryCount: job.retryCount,
                error
            });
        }
    }

    /**
     * Get pending jobs
     */
    async getPendingJobs(limit: number = 10): Promise<ProcessingJob[]> {
        return this.collection
            .find({ status: ProcessingStatus.PENDING })
            .sort({
                priority: { high: 3, medium: 2, low: 1 },
                createdAt: 1
            })
            .limit(limit)
            .toArray();
    }

    /**
     * Start processing jobs
     */
    private startProcessing(): void {
        if (this.processingInterval) {
            return;
        }

        this.processingInterval = setInterval(async () => {
            if (this.isProcessing) {
                return;
            }

            this.isProcessing = true;
            try {
                await this.processJobs();
            } catch (error) {
                logger.error('Error processing jobs', { error });
            } finally {
                this.isProcessing = false;
            }
        }, 5000); // Process every 5 seconds

        logger.info('Processing queue started');
    }

    /**
     * Process pending jobs
     */
    private async processJobs(): Promise<void> {
        const pendingJobs = await this.getPendingJobs(5);

        if (pendingJobs.length === 0) {
            return;
        }

        logger.debug('Processing jobs', { count: pendingJobs.length });

        // Process jobs in parallel
        const processingPromises = pendingJobs.map(job => this.processJob(job));
        await Promise.allSettled(processingPromises);
    }

    /**
     * Process a single job
     */
    private async processJob(job: ProcessingJob): Promise<void> {
        try {
            // Mark job as processing
            await this.updateJobProgress(job.jobId, 0, ProcessingStatus.PROCESSING);

            // Process based on job type
            switch (job.jobType) {
                case ProcessingJobType.VIRUS_SCAN:
                    await this.processVirusScan(job);
                    break;
                case ProcessingJobType.METADATA_EXTRACTION:
                    await this.processMetadataExtraction(job);
                    break;
                case ProcessingJobType.THUMBNAIL_GENERATION:
                    await this.processThumbnailGeneration(job);
                    break;
                case ProcessingJobType.FACE_DETECTION:
                    await this.processFaceDetection(job);
                    break;
                case ProcessingJobType.FACE_BLUR:
                    await this.processFaceBlur(job);
                    break;
                case 'secure_deletion':
                    await this.processSecureDeletion(job);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.jobType}`);
            }

        } catch (error) {
            await this.failJob(job.jobId, error.message);
        }
    }

    /**
     * Job processors
     */

    private async processVirusScan(job: ProcessingJob): Promise<void> {
        // Simulate virus scanning
        await this.updateJobProgress(job.jobId, 50);

        // In a real implementation, this would integrate with antivirus software
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.completeJob(job.jobId, {
            virusFound: false,
            scanEngine: 'mock-scanner',
            scanTime: new Date()
        });
    }

    private async processMetadataExtraction(job: ProcessingJob): Promise<void> {
        // Simulate metadata extraction
        await this.updateJobProgress(job.jobId, 30);

        // In a real implementation, this would use libraries like exifr, ffprobe, etc.
        await new Promise(resolve => setTimeout(resolve, 1500));

        await this.updateJobProgress(job.jobId, 80);

        const mockMetadata = {
            extractedAt: new Date(),
            width: 1920,
            height: 1080,
            colorSpace: 'sRGB',
            hasAlpha: false
        };

        // Update file metadata in database
        await this.db.collection('media_files').updateOne(
            { fileId: job.fileId },
            { $set: { 'metadata': mockMetadata } }
        );

        await this.completeJob(job.jobId, mockMetadata);
    }

    private async processThumbnailGeneration(job: ProcessingJob): Promise<void> {
        // Simulate thumbnail generation
        await this.updateJobProgress(job.jobId, 25);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.updateJobProgress(job.jobId, 75);

        const thumbnails = [
            { size: 'small', width: 150, height: 150, fileName: `thumb_small_${job.fileId}.jpg` },
            { size: 'medium', width: 300, height: 300, fileName: `thumb_medium_${job.fileId}.jpg` },
            { size: 'large', width: 600, height: 600, fileName: `thumb_large_${job.fileId}.jpg` }
        ];

        // Update file with thumbnail info
        await this.db.collection('media_files').updateOne(
            { fileId: job.fileId },
            { $set: { thumbnails } }
        );

        await this.completeJob(job.jobId, { thumbnails });
    }

    private async processFaceDetection(job: ProcessingJob): Promise<void> {
        // Simulate face detection
        await this.updateJobProgress(job.jobId, 40);
        await new Promise(resolve => setTimeout(resolve, 3000));

        const faces = [
            {
                boundingBox: { x: 100, y: 150, width: 200, height: 250 },
                confidence: 0.95,
                isBlurred: false
            }
        ];

        // Update file metadata
        await this.db.collection('media_files').updateOne(
            { fileId: job.fileId },
            { $set: { 'metadata.faces': faces } }
        );

        await this.completeJob(job.jobId, { faces });
    }

    private async processFaceBlur(job: ProcessingJob): Promise<void> {
        // Simulate face blurring
        await this.updateJobProgress(job.jobId, 60);
        await new Promise(resolve => setTimeout(resolve, 2500));

        await this.completeJob(job.jobId, {
            facesBlurred: 1,
            processedAt: new Date()
        });
    }

    private async processSecureDeletion(job: ProcessingJob): Promise<void> {
        // Simulate secure deletion
        await this.updateJobProgress(job.jobId, 100);

        // In a real implementation, this would securely delete the file
        logger.info('File securely deleted', { fileId: job.fileId });

        await this.completeJob(job.jobId, {
            deletedAt: new Date(),
            method: 'secure_overwrite'
        });
    }

    /**
     * Stop processing
     */
    async shutdown(): Promise<void> {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }

        logger.info('Processing queue stopped');
    }
}