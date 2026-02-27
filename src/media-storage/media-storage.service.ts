/**
 * Media Storage Main Service
 * 
 * Main orchestrator service that coordinates all media storage operations
 * and provides a unified interface for the module.
 */

import { MongoClient } from 'mongodb';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageProvider } from './providers/storage-provider.interface';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { FileUploadService } from './services/file-upload.service';
import { StorageService } from './services/storage.service';
import { StorageProvider as StorageProviderEnum } from './interfaces';
import { Logger } from '../shared/utils/logger.util';
import { AppError } from '../shared/utils/app-error.util';

export class MediaStorageService {
    private logger = Logger.getInstance();
    private storageProvider: StorageProvider;
    private uploadService: FileUploadService;
    private storageService: StorageService;

    constructor(
        private dbClient: MongoClient,
        private config: {
            provider: StorageProviderEnum;
            s3?: {
                region: string;
                bucket: string;
                accessKeyId: string;
                secretAccessKey: string;
                endpoint?: string;
            };
            local?: {
                basePath: string;
            };
        }
    ) {
        this.initializeServices();
    }

    /**
     * Initialize all service components
     */
    private initializeServices(): void {
        try {
            // Initialize storage provider
            this.storageProvider = this.createStorageProvider();

            // Initialize upload service
            this.uploadService = new FileUploadService(this.storageProvider);

            // Initialize main storage service
            this.storageService = new StorageService(
                this.dbClient,
                this.storageProvider,
                this.uploadService,
                this.config.provider
            );

            // Start periodic cleanup
            this.uploadService.startPeriodicCleanup();

            this.logger.info('Media Storage service initialized successfully', {
                provider: this.config.provider
            });
        } catch (error) {
            this.logger.error('Error initializing Media Storage service:', error);
            throw new AppError('Failed to initialize Media Storage service', 500);
        }
    }

    /**
     * Create storage provider based on configuration
     */
    private createStorageProvider(): StorageProvider {
        switch (this.config.provider) {
            case StorageProviderEnum.S3:
                if (!this.config.s3) {
                    throw new AppError('S3 configuration is required for S3 provider', 500);
                }

                const s3Client = new S3Client({
                    region: this.config.s3.region,
                    credentials: {
                        accessKeyId: this.config.s3.accessKeyId,
                        secretAccessKey: this.config.s3.secretAccessKey
                    },
                    endpoint: this.config.s3.endpoint
                });

                return new S3StorageProvider(
                    s3Client,
                    this.config.s3.bucket,
                    this.config.s3.region
                );

            case StorageProviderEnum.LOCAL:
                if (!this.config.local) {
                    throw new AppError('Local configuration is required for local provider', 500);
                }

                return new LocalStorageProvider(this.config.local.basePath);

            default:
                throw new AppError(`Unsupported storage provider: ${this.config.provider}`, 500);
        }
    }

    /**
     * Initialize database indexes
     */
    async initializeDatabase(): Promise<void> {
        try {
            await this.storageService.createIndexes();
            this.logger.info('Media Storage database initialized successfully');
        } catch (error) {
            this.logger.error('Error initializing Media Storage database:', error);
            throw new AppError('Failed to initialize Media Storage database', 500);
        }
    }

    /**
     * Get the storage service for direct access
     */
    getStorageService(): StorageService {
        return this.storageService;
    }

    /**
     * Get the upload service for direct access
     */
    getUploadService(): FileUploadService {
        return this.uploadService;
    }

    /**
     * Get the storage provider for direct access
     */
    getStorageProvider(): StorageProvider {
        return this.storageProvider;
    }

    /**
     * Health check for the service
     */
    async healthCheck(): Promise<{
        status: string;
        timestamp: string;
        components: Record<string, string>;
        provider: string;
    }> {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            provider: this.config.provider,
            components: {
                storageProvider: 'healthy',
                uploadService: 'healthy',
                storageService: 'healthy',
                database: 'healthy'
            }
        };

        try {
            // Test storage provider
            await this.storageProvider.listFiles('health-check/', 1);
        } catch (error) {
            health.status = 'unhealthy';
            health.components.storageProvider = 'unhealthy';
            this.logger.error('Storage provider health check failed:', error);
        }

        try {
            // Test database connection
            await this.storageService.searchMediaFiles({ tenantId: 'health-check' }, 1, 0);
        } catch (error) {
            health.status = 'unhealthy';
            health.components.database = 'unhealthy';
            this.logger.error('Database health check failed:', error);
        }

        return health;
    }

    /**
     * Get storage statistics
     */
    async getStorageStatistics(tenantId?: string): Promise<{
        totalFiles: number;
        totalSizeBytes: number;
        storageUsage: {
            totalFiles: number;
            totalSizeBytes: number;
        };
    }> {
        try {
            // Get database statistics
            const searchResult = await this.storageService.searchMediaFiles(
                { tenantId, isDeleted: false },
                Number.MAX_SAFE_INTEGER,
                0
            );

            const totalSizeBytes = searchResult.files.reduce((sum, file) => sum + file.fileSize, 0);

            // Get storage provider usage
            const prefix = tenantId ? `tenants/${tenantId}/` : '';
            const storageUsage = await this.storageProvider.getStorageUsage(prefix);

            return {
                totalFiles: searchResult.total,
                totalSizeBytes,
                storageUsage
            };
        } catch (error) {
            this.logger.error('Error getting storage statistics:', error);
            throw new AppError('Failed to get storage statistics', 500);
        }
    }

    /**
     * Cleanup orphaned files (files in storage but not in database)
     */
    async cleanupOrphanedFiles(tenantId?: string): Promise<{
        orphanedFiles: number;
        cleanedUpFiles: number;
        errors: string[];
    }> {
        const result = {
            orphanedFiles: 0,
            cleanedUpFiles: 0,
            errors: [] as string[]
        };

        try {
            const prefix = tenantId ? `tenants/${tenantId}/` : 'tenants/';
            const storageFiles = await this.storageProvider.listFiles(prefix);

            for (const storageFile of storageFiles) {
                try {
                    // Check if file exists in database
                    const searchResult = await this.storageService.searchMediaFiles(
                        { tenantId },
                        1,
                        0
                    );

                    const fileExists = searchResult.files.some(dbFile =>
                        dbFile.storageKey === storageFile.key
                    );

                    if (!fileExists) {
                        result.orphanedFiles++;

                        // Delete orphaned file
                        await this.storageProvider.deleteFile(storageFile.key);
                        result.cleanedUpFiles++;

                        this.logger.info(`Cleaned up orphaned file: ${storageFile.key}`);
                    }
                } catch (error) {
                    const errorMsg = `Failed to process file ${storageFile.key}: ${error}`;
                    result.errors.push(errorMsg);
                    this.logger.error(errorMsg);
                }
            }

            this.logger.info('Orphaned file cleanup completed', result);
            return result;
        } catch (error) {
            this.logger.error('Error during orphaned file cleanup:', error);
            throw new AppError('Failed to cleanup orphaned files', 500);
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        try {
            this.logger.info('Shutting down Media Storage service...');
            // Perform any cleanup operations here
            this.logger.info('Media Storage service shutdown complete');
        } catch (error) {
            this.logger.error('Error during Media Storage service shutdown:', error);
            throw error;
        }
    }
}