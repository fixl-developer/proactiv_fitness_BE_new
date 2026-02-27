/**
 * File Upload Service
 * 
 * Handles file upload operations including validation, virus scanning,
 * and upload session management.
 */

import { StorageProvider } from '../providers/storage-provider.interface';
import {
    MediaUploadRequest,
    MediaUploadResponse,
    UploadSession,
    UploadStatus,
    MediaCategory,
    VirusScanResult
} from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export class FileUploadService {
    private logger = Logger.getInstance();
    private uploadSessions = new Map<string, UploadSession>();

    // File size limits in bytes
    private readonly FILE_SIZE_LIMITS = {
        [MediaCategory.CHILD_PHOTO]: 10 * 1024 * 1024, // 10MB
        [MediaCategory.CHILD_VIDEO]: 100 * 1024 * 1024, // 100MB
        [MediaCategory.SKILL_EVIDENCE]: 10 * 1024 * 1024, // 10MB
        [MediaCategory.INCIDENT_REPORT]: 25 * 1024 * 1024, // 25MB
        [MediaCategory.CERTIFICATION]: 25 * 1024 * 1024, // 25MB
        [MediaCategory.LEGAL_DOCUMENT]: 25 * 1024 * 1024, // 25MB
        [MediaCategory.MARKETING_MATERIAL]: 50 * 1024 * 1024 // 50MB
    };

    // Allowed MIME types by category
    private readonly ALLOWED_MIME_TYPES = {
        [MediaCategory.CHILD_PHOTO]: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ],
        [MediaCategory.CHILD_VIDEO]: [
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'
        ],
        [MediaCategory.SKILL_EVIDENCE]: [
            'image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'
        ],
        [MediaCategory.INCIDENT_REPORT]: [
            'image/jpeg', 'image/png', 'application/pdf', 'text/plain'
        ],
        [MediaCategory.CERTIFICATION]: [
            'application/pdf', 'image/jpeg', 'image/png'
        ],
        [MediaCategory.LEGAL_DOCUMENT]: [
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        [MediaCategory.MARKETING_MATERIAL]: [
            'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'
        ]
    };

    constructor(
        private storageProvider: StorageProvider,
        private virusScannerService?: any // Optional virus scanner
    ) { }

    /**
     * Initiate file upload
     */
    async initiateUpload(
        request: MediaUploadRequest,
        tenantId: string,
        uploadedBy: string
    ): Promise<MediaUploadResponse> {
        try {
            // Validate file
            this.validateFile(request);

            const fileId = uuidv4();
            const sessionId = uuidv4();

            // Determine if consent is required
            const requiresConsent = this.requiresConsent(request.category);

            // Create upload session
            const session: UploadSession = {
                sessionId,
                filename: request.filename,
                fileSize: request.fileSize,
                mimeType: request.mimeType,
                category: request.category,
                tenantId,
                uploadedBy,
                status: UploadStatus.PENDING,
                uploadedBytes: 0,
                totalBytes: request.fileSize,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            };

            // Generate storage key
            const storageKey = this.generateStorageKey(tenantId, fileId, request.filename);
            session.storageKey = storageKey;

            // For large files, use multipart upload
            if (request.fileSize > 5 * 1024 * 1024) { // 5MB threshold
                const multipartUpload = await this.storageProvider.generateMultipartUploadUrl(
                    storageKey,
                    60, // 1 hour expiration
                    request.mimeType
                );
                session.uploadUrl = multipartUpload.uploadUrl;
            } else {
                // Generate signed URL for direct upload
                const signedUrl = await this.storageProvider.generateSignedUrl(
                    storageKey,
                    60, // 1 hour expiration
                    'put',
                    { contentType: request.mimeType }
                );
                session.uploadUrl = signedUrl.url;
            }

            // Store session
            this.uploadSessions.set(sessionId, session);

            this.logger.info(`Upload session created: ${sessionId}`, {
                fileId,
                sessionId,
                filename: request.filename,
                tenantId,
                uploadedBy
            });

            return {
                fileId,
                uploadUrl: session.uploadUrl,
                sessionId,
                requiresConsent
            };
        } catch (error) {
            this.logger.error('Error initiating file upload:', error);
            throw error instanceof AppError ? error : new AppError('Failed to initiate upload', 500);
        }
    }

    /**
     * Complete file upload
     */
    async completeUpload(sessionId: string): Promise<{
        fileId: string;
        storageKey: string;
        fileSize: number;
        virusScanResult?: VirusScanResult;
    }> {
        try {
            const session = this.uploadSessions.get(sessionId);
            if (!session) {
                throw new AppError('Upload session not found', 404);
            }

            if (session.status === UploadStatus.COMPLETED) {
                throw new AppError('Upload already completed', 409);
            }

            if (new Date() > session.expiresAt) {
                throw new AppError('Upload session expired', 410);
            }

            // Update session status
            session.status = UploadStatus.PROCESSING;
            session.completedAt = new Date();

            // Verify file exists in storage
            const fileExists = await this.storageProvider.fileExists(session.storageKey!);
            if (!fileExists) {
                throw new AppError('File not found in storage', 404);
            }

            // Get actual file size
            const metadata = await this.storageProvider.getFileMetadata(session.storageKey!);
            const actualFileSize = metadata.size;

            // Validate file size matches expected
            if (Math.abs(actualFileSize - session.fileSize) > 1024) { // Allow 1KB tolerance
                this.logger.warn(`File size mismatch for session ${sessionId}`, {
                    expected: session.fileSize,
                    actual: actualFileSize
                });
            }

            // Perform virus scan if available
            let virusScanResult: VirusScanResult | undefined;
            if (this.virusScannerService) {
                try {
                    virusScanResult = await this.performVirusScan(session.storageKey!);

                    if (!virusScanResult.isClean) {
                        // Delete infected file
                        await this.storageProvider.deleteFile(session.storageKey!);
                        session.status = UploadStatus.FAILED;
                        session.errorMessage = `Virus detected: ${virusScanResult.threatName}`;

                        throw new AppError('File contains malware and has been deleted', 400);
                    }
                } catch (error) {
                    this.logger.error(`Virus scan failed for session ${sessionId}:`, error);
                    // Continue without virus scan if service is unavailable
                }
            }

            // Mark session as completed
            session.status = UploadStatus.COMPLETED;
            session.uploadedBytes = actualFileSize;

            const fileId = session.storageKey!.split('/').pop()?.split('.')[0] || uuidv4();

            this.logger.info(`Upload completed: ${sessionId}`, {
                fileId,
                sessionId,
                fileSize: actualFileSize,
                virusScanClean: virusScanResult?.isClean
            });

            return {
                fileId,
                storageKey: session.storageKey!,
                fileSize: actualFileSize,
                virusScanResult
            };
        } catch (error) {
            this.logger.error('Error completing file upload:', error);
            throw error instanceof AppError ? error : new AppError('Failed to complete upload', 500);
        }
    }

    /**
     * Get upload session status
     */
    getUploadSession(sessionId: string): UploadSession | null {
        return this.uploadSessions.get(sessionId) || null;
    }

    /**
     * Cancel upload session
     */
    async cancelUpload(sessionId: string): Promise<void> {
        try {
            const session = this.uploadSessions.get(sessionId);
            if (!session) {
                throw new AppError('Upload session not found', 404);
            }

            // Delete file from storage if it exists
            if (session.storageKey) {
                try {
                    await this.storageProvider.deleteFile(session.storageKey);
                } catch (error) {
                    this.logger.warn(`Failed to delete file during upload cancellation: ${session.storageKey}`, error);
                }
            }

            // Remove session
            this.uploadSessions.delete(sessionId);

            this.logger.info(`Upload cancelled: ${sessionId}`);
        } catch (error) {
            this.logger.error('Error cancelling upload:', error);
            throw error instanceof AppError ? error : new AppError('Failed to cancel upload', 500);
        }
    }

    /**
     * Validate file upload request
     */
    private validateFile(request: MediaUploadRequest): void {
        const errors: string[] = [];

        // Check file size
        const maxSize = this.FILE_SIZE_LIMITS[request.category];
        if (request.fileSize > maxSize) {
            errors.push(`File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB for ${request.category}`);
        }

        if (request.fileSize <= 0) {
            errors.push('File size must be greater than 0');
        }

        // Check MIME type
        const allowedTypes = this.ALLOWED_MIME_TYPES[request.category];
        if (!allowedTypes.includes(request.mimeType)) {
            errors.push(`MIME type ${request.mimeType} not allowed for ${request.category}`);
        }

        // Check filename
        if (!request.filename || request.filename.trim().length === 0) {
            errors.push('Filename is required');
        }

        // Check for dangerous file extensions
        const ext = path.extname(request.filename).toLowerCase();
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
        if (dangerousExtensions.includes(ext)) {
            errors.push(`File extension ${ext} is not allowed`);
        }

        if (errors.length > 0) {
            throw new AppError(`File validation failed: ${errors.join(', ')}`, 400);
        }
    }

    /**
     * Check if category requires consent
     */
    private requiresConsent(category: MediaCategory): boolean {
        return category === MediaCategory.CHILD_PHOTO || category === MediaCategory.CHILD_VIDEO;
    }

    /**
     * Generate storage key for file
     */
    private generateStorageKey(tenantId: string, fileId: string, filename: string): string {
        const ext = path.extname(filename);
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');

        return `tenants/${tenantId}/media/${year}/${month}/${fileId}${ext}`;
    }

    /**
     * Perform virus scan on uploaded file
     */
    private async performVirusScan(storageKey: string): Promise<VirusScanResult> {
        if (!this.virusScannerService) {
            return {
                isClean: true,
                scanDate: new Date(),
                scanEngine: 'none'
            };
        }

        try {
            // Download file for scanning
            const { buffer } = await this.storageProvider.downloadFile(storageKey);

            // Perform scan (this would integrate with actual virus scanner)
            const scanResult = await this.virusScannerService.scanBuffer(buffer);

            return {
                isClean: scanResult.isClean,
                threatName: scanResult.threatName,
                scanDate: new Date(),
                scanEngine: scanResult.engine || 'clamav'
            };
        } catch (error) {
            this.logger.error(`Virus scan error for ${storageKey}:`, error);
            throw new AppError('Virus scan failed', 500);
        }
    }

    /**
     * Clean up expired upload sessions
     */
    cleanupExpiredSessions(): void {
        const now = new Date();
        const expiredSessions: string[] = [];

        for (const [sessionId, session] of this.uploadSessions.entries()) {
            if (now > session.expiresAt) {
                expiredSessions.push(sessionId);
            }
        }

        expiredSessions.forEach(sessionId => {
            const session = this.uploadSessions.get(sessionId);
            if (session?.storageKey) {
                // Attempt to clean up storage
                this.storageProvider.deleteFile(session.storageKey).catch(error => {
                    this.logger.warn(`Failed to cleanup expired session file: ${session.storageKey}`, error);
                });
            }
            this.uploadSessions.delete(sessionId);
        });

        if (expiredSessions.length > 0) {
            this.logger.info(`Cleaned up ${expiredSessions.length} expired upload sessions`);
        }
    }

    /**
     * Start periodic cleanup of expired sessions
     */
    startPeriodicCleanup(): void {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000); // Run every hour
    }
}