/**
 * Storage Service
 * 
 * Main service for media storage operations including access control,
 * metadata management, and signed URL generation.
 */

import { Collection, MongoClient } from 'mongodb';
import { StorageProvider } from '../providers/storage-provider.interface';
import { FileUploadService } from './file-upload.service';
import {
    MediaFile,
    MediaUploadRequest,
    MediaUploadResponse,
    SignedUrlRequest,
    SignedUrlResponse,
    MediaSearchFilters,
    MediaMetadata,
    ConsentStatus,
    ConsentState,
    MediaCategory,
    AccessLevel,
    StorageProvider as StorageProviderEnum
} from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
    private logger = Logger.getInstance();
    private mediaCollection: Collection<MediaFile>;

    constructor(
        private dbClient: MongoClient,
        private storageProvider: StorageProvider,
        private uploadService: FileUploadService,
        private storageProviderType: StorageProviderEnum
    ) {
        const dbName = process.env.MONGODB_DATABASE_NAME || 'proactiv_fitness_db';
        const db = this.dbClient.db(dbName);
        this.mediaCollection = db.collection('media_files');
    }

    /**
     * Initiate file upload
     */
    async initiateUpload(
        request: MediaUploadRequest,
        tenantId: string,
        uploadedBy: string
    ): Promise<MediaUploadResponse> {
        try {
            return await this.uploadService.initiateUpload(request, tenantId, uploadedBy);
        } catch (error) {
            this.logger.error('Error initiating upload:', error);
            throw error instanceof AppError ? error : new AppError('Failed to initiate upload', 500);
        }
    }

    /**
     * Complete file upload and create media record
     */
    async completeUpload(
        sessionId: string,
        tenantId: string,
        uploadedBy: string,
        metadata?: Partial<MediaMetadata>,
        consentStatus?: ConsentStatus
    ): Promise<MediaFile> {
        try {
            // Complete upload
            const uploadResult = await this.uploadService.completeUpload(sessionId);
            const session = this.uploadService.getUploadSession(sessionId);

            if (!session) {
                throw new AppError('Upload session not found', 404);
            }

            // Create media file record
            const mediaFile: MediaFile = {
                id: uuidv4(),
                filename: session.filename,
                originalFilename: session.filename,
                mimeType: session.mimeType,
                fileSize: uploadResult.fileSize,
                category: session.category,
                accessLevel: this.determineAccessLevel(session.category),
                storageProvider: this.storageProviderType,
                storagePath: uploadResult.storageKey,
                storageKey: uploadResult.storageKey,
                tenantId,
                metadata: {
                    title: metadata?.title,
                    description: metadata?.description,
                    tags: metadata?.tags || [],
                    customFields: metadata?.customFields || {},
                    uploadedBy,
                    uploadedAt: new Date(),
                    ...metadata
                },
                consentStatus,
                version: 1,
                isLatestVersion: true,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Insert into database
            await this.mediaCollection.insertOne(mediaFile as any);

            // Emit audit event
            this.emitAuditEvent('upload', mediaFile, uploadedBy);

            this.logger.info(`Media file created: ${mediaFile.id}`, {
                fileId: mediaFile.id,
                filename: mediaFile.filename,
                category: mediaFile.category,
                tenantId,
                uploadedBy
            });

            return mediaFile;
        } catch (error) {
            this.logger.error('Error completing upload:', error);
            throw error instanceof AppError ? error : new AppError('Failed to complete upload', 500);
        }
    }

    /**
     * Generate signed URL for file access
     */
    async generateSignedUrl(
        request: SignedUrlRequest,
        tenantId: string,
        userId: string
    ): Promise<SignedUrlResponse> {
        try {
            // Get media file
            const mediaFile = await this.getMediaFile(request.fileId, tenantId);

            // Check access permissions
            await this.checkAccessPermissions(mediaFile, userId);

            // Generate signed URL
            const signedUrl = await this.storageProvider.generateSignedUrl(
                mediaFile.storageKey,
                request.expirationMinutes || 60,
                'get',
                {
                    contentDisposition: request.contentDisposition || 'inline',
                    downloadFilename: request.downloadFilename || mediaFile.filename
                }
            );

            // Emit audit event
            this.emitAuditEvent('access', mediaFile, userId);

            this.logger.info(`Signed URL generated: ${mediaFile.id}`, {
                fileId: mediaFile.id,
                tenantId,
                userId,
                expiresAt: signedUrl.expiresAt
            });

            return signedUrl;
        } catch (error) {
            this.logger.error('Error generating signed URL:', error);
            throw error instanceof AppError ? error : new AppError('Failed to generate signed URL', 500);
        }
    }

    /**
     * Get media file by ID
     */
    async getMediaFile(fileId: string, tenantId: string): Promise<MediaFile> {
        try {
            const mediaFile = await this.mediaCollection.findOne({
                id: fileId,
                tenantId,
                isDeleted: false
            });

            if (!mediaFile) {
                throw new AppError('Media file not found', 404);
            }

            return mediaFile;
        } catch (error) {
            this.logger.error('Error getting media file:', error);
            throw error instanceof AppError ? error : new AppError('Failed to get media file', 500);
        }
    }

    /**
     * Search media files
     */
    async searchMediaFiles(
        filters: MediaSearchFilters,
        limit = 50,
        offset = 0
    ): Promise<{
        files: MediaFile[];
        total: number;
        hasMore: boolean;
    }> {
        try {
            const query: any = {};

            // Apply filters
            if (filters.tenantId) query.tenantId = filters.tenantId;
            if (filters.category) query.category = filters.category;
            if (filters.uploadedBy) query['metadata.uploadedBy'] = filters.uploadedBy;
            if (filters.accessLevel) query.accessLevel = filters.accessLevel;
            if (filters.isDeleted !== undefined) query.isDeleted = filters.isDeleted;

            if (filters.tags && filters.tags.length > 0) {
                query['metadata.tags'] = { $in: filters.tags };
            }

            if (filters.uploadedAfter || filters.uploadedBefore) {
                query['metadata.uploadedAt'] = {};
                if (filters.uploadedAfter) query['metadata.uploadedAt'].$gte = filters.uploadedAfter;
                if (filters.uploadedBefore) query['metadata.uploadedAt'].$lte = filters.uploadedBefore;
            }

            if (filters.consentState) {
                query['consentStatus.state'] = filters.consentState;
            }

            if (filters.hasConsent !== undefined) {
                if (filters.hasConsent) {
                    query.consentStatus = { $exists: true };
                } else {
                    query.consentStatus = { $exists: false };
                }
            }

            // Get total count
            const total = await this.mediaCollection.countDocuments(query);

            // Get files
            const files = await this.mediaCollection
                .find(query)
                .sort({ 'metadata.uploadedAt': -1 })
                .skip(offset)
                .limit(limit)
                .toArray();

            return {
                files,
                total,
                hasMore: offset + files.length < total
            };
        } catch (error) {
            this.logger.error('Error searching media files:', error);
            throw new AppError('Failed to search media files', 500);
        }
    }

    /**
     * Update media metadata
     */
    async updateMetadata(
        fileId: string,
        tenantId: string,
        updates: Partial<MediaMetadata>,
        updatedBy: string
    ): Promise<MediaFile> {
        try {
            const mediaFile = await this.getMediaFile(fileId, tenantId);

            const updatedMetadata = {
                ...mediaFile.metadata,
                ...updates,
                lastModifiedBy: updatedBy,
                lastModifiedAt: new Date()
            };

            const result = await this.mediaCollection.findOneAndUpdate(
                { id: fileId, tenantId, isDeleted: false },
                {
                    $set: {
                        metadata: updatedMetadata,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                throw new AppError('Failed to update media metadata', 500);
            }

            // Emit audit event
            this.emitAuditEvent('metadata_update', result.value, updatedBy);

            this.logger.info(`Media metadata updated: ${fileId}`, {
                fileId,
                tenantId,
                updatedBy
            });

            return result.value;
        } catch (error) {
            this.logger.error('Error updating media metadata:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update metadata', 500);
        }
    }

    /**
     * Update consent status
     */
    async updateConsentStatus(
        fileId: string,
        tenantId: string,
        consentStatus: ConsentStatus,
        updatedBy: string
    ): Promise<MediaFile> {
        try {
            const mediaFile = await this.getMediaFile(fileId, tenantId);

            // Validate that file requires consent
            if (!this.requiresConsent(mediaFile.category)) {
                throw new AppError('File does not require consent', 400);
            }

            const result = await this.mediaCollection.findOneAndUpdate(
                { id: fileId, tenantId, isDeleted: false },
                {
                    $set: {
                        consentStatus,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                throw new AppError('Failed to update consent status', 500);
            }

            // Emit audit event
            this.emitAuditEvent('consent_change', result.value, updatedBy, {
                previousState: mediaFile.consentStatus?.state,
                newState: consentStatus.state
            });

            this.logger.info(`Consent status updated: ${fileId}`, {
                fileId,
                tenantId,
                newState: consentStatus.state,
                updatedBy
            });

            return result.value;
        } catch (error) {
            this.logger.error('Error updating consent status:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update consent status', 500);
        }
    }

    /**
     * Soft delete media file
     */
    async deleteMediaFile(
        fileId: string,
        tenantId: string,
        deletedBy: string,
        reason?: string
    ): Promise<void> {
        try {
            const mediaFile = await this.getMediaFile(fileId, tenantId);

            const result = await this.mediaCollection.findOneAndUpdate(
                { id: fileId, tenantId, isDeleted: false },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        deletedBy,
                        deletionReason: reason,
                        permanentDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                        updatedAt: new Date()
                    }
                }
            );

            if (!result.value) {
                throw new AppError('Failed to delete media file', 500);
            }

            // Emit audit event
            this.emitAuditEvent('delete', mediaFile, deletedBy, { reason });

            this.logger.info(`Media file deleted: ${fileId}`, {
                fileId,
                tenantId,
                deletedBy,
                reason
            });
        } catch (error) {
            this.logger.error('Error deleting media file:', error);
            throw error instanceof AppError ? error : new AppError('Failed to delete media file', 500);
        }
    }

    /**
     * Check access permissions for media file
     */
    private async checkAccessPermissions(mediaFile: MediaFile, userId: string): Promise<void> {
        // Check if file requires consent
        if (this.requiresConsent(mediaFile.category)) {
            if (!mediaFile.consentStatus || mediaFile.consentStatus.state !== ConsentState.APPROVED) {
                throw new AppError('Access denied: consent not granted', 403);
            }
        }

        // Check access level
        if (mediaFile.accessLevel === AccessLevel.RESTRICTED) {
            // This would integrate with IAM to check specific permissions
            // For now, allow access
        }

        // Check if file is deleted
        if (mediaFile.isDeleted) {
            throw new AppError('File has been deleted', 404);
        }
    }

    /**
     * Determine access level based on category
     */
    private determineAccessLevel(category: MediaCategory): AccessLevel {
        switch (category) {
            case MediaCategory.CHILD_PHOTO:
            case MediaCategory.CHILD_VIDEO:
            case MediaCategory.INCIDENT_REPORT:
            case MediaCategory.LEGAL_DOCUMENT:
                return AccessLevel.RESTRICTED;
            case MediaCategory.CERTIFICATION:
                return AccessLevel.PRIVATE;
            default:
                return AccessLevel.PUBLIC;
        }
    }

    /**
     * Check if category requires consent
     */
    private requiresConsent(category: MediaCategory): boolean {
        return category === MediaCategory.CHILD_PHOTO || category === MediaCategory.CHILD_VIDEO;
    }

    /**
     * Emit audit event
     */
    private emitAuditEvent(
        eventType: string,
        mediaFile: MediaFile,
        userId: string,
        metadata?: any
    ): void {
        // This would integrate with the Audit & Compliance Vault
        this.logger.info(`Media audit event: ${eventType}`, {
            eventType,
            fileId: mediaFile.id,
            tenantId: mediaFile.tenantId,
            userId,
            metadata
        });
    }

    /**
     * Create database indexes
     */
    async createIndexes(): Promise<void> {
        try {
            await this.mediaCollection.createIndexes([
                {
                    key: { id: 1, tenantId: 1 },
                    unique: true,
                    name: 'media_id_tenant_unique'
                },
                {
                    key: { tenantId: 1, isDeleted: 1 },
                    name: 'tenant_deleted_index'
                },
                {
                    key: { category: 1 },
                    name: 'category_index'
                },
                {
                    key: { 'metadata.tags': 1 },
                    name: 'tags_index'
                },
                {
                    key: { 'metadata.uploadedAt': -1 },
                    name: 'uploaded_at_index'
                },
                {
                    key: { 'metadata.uploadedBy': 1 },
                    name: 'uploaded_by_index'
                },
                {
                    key: { 'consentStatus.state': 1 },
                    name: 'consent_state_index'
                },
                {
                    key: { storageKey: 1 },
                    name: 'storage_key_index'
                }
            ]);

            this.logger.info('Media storage indexes created successfully');
        } catch (error) {
            this.logger.error('Error creating media storage indexes:', error);
            throw new AppError('Failed to create media storage indexes', 500);
        }
    }
}