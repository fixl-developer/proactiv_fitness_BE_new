/**
 * Media Storage Controller
 * 
 * HTTP request handlers for media storage operations
 */

import { Request, Response } from 'express';
import { MediaStorageService } from '../media-storage.service';
import {
    MediaUploadRequest,
    SignedUrlRequest,
    MediaSearchFilters,
    MediaMetadata,
    ConsentStatus
} from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';
import { ResponseUtil } from '../../shared/utils/response.util';
import { asyncHandler } from '../../shared/utils/async-handler.util';

export class MediaStorageController {
    private logger = Logger.getInstance();

    constructor(private mediaStorageService: MediaStorageService) { }

    /**
     * Upload a single file
     * POST /api/media/upload
     */
    uploadFile = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No file provided', 400);
        }

        const uploadRequest: MediaUploadRequest = {
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            category: req.body.category,
            accessLevel: req.body.accessLevel,
            metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
            generateThumbnails: req.body.generateThumbnails === 'true',
            enableFaceBlur: req.body.enableFaceBlur === 'true'
        };

        const tenantId = req.user?.tenantId || 'default';
        const uploadedBy = req.user?.id || 'system';

        // Initiate upload
        const uploadResponse = await this.mediaStorageService
            .getUploadService()
            .initiateUpload(uploadRequest, tenantId, uploadedBy);

        // For direct upload, complete immediately
        // In production, this would be handled by the client
        const sessionId = uploadResponse.sessionId!;
        const mediaFile = await this.mediaStorageService
            .getStorageService()
            .completeUpload(sessionId, tenantId, uploadedBy, uploadRequest.metadata);

        ResponseUtil.success(res, mediaFile, 'File uploaded successfully', 201);
    });

    /**
     * Upload multiple files
     * POST /api/media/upload-multiple
     */
    uploadMultipleFiles = asyncHandler(async (req: Request, res: Response) => {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new AppError('No files provided', 400);
        }

        const tenantId = req.user?.tenantId || 'default';
        const uploadedBy = req.user?.id || 'system';
        const results = [];

        for (const file of req.files) {
            const uploadRequest: MediaUploadRequest = {
                filename: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                category: req.body.category,
                accessLevel: req.body.accessLevel,
                generateThumbnails: req.body.generateThumbnails === 'true',
                enableFaceBlur: req.body.enableFaceBlur === 'true'
            };

            try {
                const uploadResponse = await this.mediaStorageService
                    .getUploadService()
                    .initiateUpload(uploadRequest, tenantId, uploadedBy);

                const mediaFile = await this.mediaStorageService
                    .getStorageService()
                    .completeUpload(uploadResponse.sessionId!, tenantId, uploadedBy);

                results.push({ success: true, file: mediaFile });
            } catch (error) {
                results.push({
                    success: false,
                    filename: file.originalname,
                    error: error instanceof Error ? error.message : 'Upload failed'
                });
            }
        }

        ResponseUtil.success(res, results, 'Files processed', 201);
    });

    /**
     * Create upload session for resumable uploads
     * POST /api/media/upload-session
     */
    createUploadSession = asyncHandler(async (req: Request, res: Response) => {
        const uploadRequest: MediaUploadRequest = req.body;
        const tenantId = req.user?.tenantId || 'default';
        const uploadedBy = req.user?.id || 'system';

        const uploadResponse = await this.mediaStorageService
            .getUploadService()
            .initiateUpload(uploadRequest, tenantId, uploadedBy);

        ResponseUtil.success(res, uploadResponse, 'Upload session created', 201);
    });

    /**
     * Complete upload session
     * PUT /api/media/upload-session/:sessionId
     */
    completeUpload = asyncHandler(async (req: Request, res: Response) => {
        const { sessionId } = req.params;
        const tenantId = req.user?.tenantId || 'default';
        const uploadedBy = req.user?.id || 'system';

        const mediaFile = await this.mediaStorageService
            .getStorageService()
            .completeUpload(sessionId, tenantId, uploadedBy, req.body.metadata, req.body.consentStatus);

        ResponseUtil.success(res, mediaFile, 'Upload completed successfully');
    });

    /**
     * Cancel upload session
     * DELETE /api/media/upload-session/:sessionId
     */
    cancelUpload = asyncHandler(async (req: Request, res: Response) => {
        const { sessionId } = req.params;

        await this.mediaStorageService
            .getUploadService()
            .cancelUpload(sessionId);

        ResponseUtil.success(res, null, 'Upload cancelled successfully');
    });

    /**
     * Generate signed URL for file access
     * GET /api/media/:fileId/signed-url
     */
    generateSignedUrl = asyncHandler(async (req: Request, res: Response) => {
        const { fileId } = req.params;
        const tenantId = req.user?.tenantId || 'default';
        const userId = req.user?.id || 'system';

        const request: SignedUrlRequest = {
            fileId,
            expirationMinutes: parseInt(req.query.expirationMinutes as string) || 60,
            downloadFilename: req.query.downloadFilename as string,
            contentDisposition: req.query.contentDisposition as 'inline' | 'attachment'
        };

        const signedUrl = await this.mediaStorageService
            .getStorageService()
            .generateSignedUrl(request, tenantId, userId);

        ResponseUtil.success(res, signedUrl, 'Signed URL generated successfully');
    });

    /**
     * Get file metadata
     * GET /api/media/:fileId/metadata
     */
    getFileMetadata = asyncHandler(async (req: Request, res: Response) => {
        const { fileId } = req.params;
        const tenantId = req.user?.tenantId || 'default';

        const mediaFile = await this.mediaStorageService
            .getStorageService()
            .getMediaFile(fileId, tenantId);

        ResponseUtil.success(res, mediaFile, 'File metadata retrieved successfully');
    });

    /**
     * Search files
     * GET /api/media/search
     */
    searchFiles = asyncHandler(async (req: Request, res: Response) => {
        const filters: MediaSearchFilters = {
            tenantId: req.user?.tenantId || 'default',
            category: req.query.category as any,
            tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
            uploadedBy: req.query.uploadedBy as string,
            uploadedAfter: req.query.uploadedAfter ? new Date(req.query.uploadedAfter as string) : undefined,
            uploadedBefore: req.query.uploadedBefore ? new Date(req.query.uploadedBefore as string) : undefined,
            consentState: req.query.consentState as any,
            accessLevel: req.query.accessLevel as any,
            isDeleted: req.query.isDeleted === 'true'
        };

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await this.mediaStorageService
            .getStorageService()
            .searchMediaFiles(filters, limit, offset);

        ResponseUtil.success(res, result, 'Files retrieved successfully');
    });

    /**
     * Update file metadata
     * PUT /api/media/:fileId/metadata
     */
    updateMetadata = asyncHandler(async (req: Request, res: Response) => {
        const { fileId } = req.params;
        const tenantId = req.user?.tenantId || 'default';
        const updatedBy = req.user?.id || 'system';
        const updates: Partial<MediaMetadata> = req.body;

        const mediaFile = await this.mediaStorageService
            .getStorageService()
            .updateMetadata(fileId, tenantId, updates, updatedBy);

        ResponseUtil.success(res, mediaFile, 'Metadata updated successfully');
    });

    /**
     * Update consent status
     * PUT /api/media/:fileId/consent
     */
    updateConsentStatus = asyncHandler(async (req: Request, res: Response) => {
        const { fileId } = req.params;
        const tenantId = req.user?.tenantId || 'default';
        const updatedBy = req.user?.id || 'system';
        const consentStatus: ConsentStatus = req.body;

        const mediaFile = await this.mediaStorageService
            .getStorageService()
            .updateConsentStatus(fileId, tenantId, consentStatus, updatedBy);

        ResponseUtil.success(res, mediaFile, 'Consent status updated successfully');
    });

    /**
     * Delete file (soft delete)
     * DELETE /api/media/:fileId
     */
    deleteFile = asyncHandler(async (req: Request, res: Response) => {
        const { fileId } = req.params;
        const tenantId = req.user?.tenantId || 'default';
        const deletedBy = req.user?.id || 'system';
        const reason = req.body.reason;

        await this.mediaStorageService
            .getStorageService()
            .deleteMediaFile(fileId, tenantId, deletedBy, reason);

        ResponseUtil.success(res, null, 'File deleted successfully');
    });

    /**
     * Health check
     * GET /api/media/health
     */
    healthCheck = asyncHandler(async (req: Request, res: Response) => {
        const health = await this.mediaStorageService.healthCheck();
        ResponseUtil.success(res, health, 'Media storage service health check');
    });

    // Placeholder methods for other endpoints
    getThumbnailSignedUrl = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    restoreFile = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    getFileVersions = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    getFileVersion = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    createFileVersion = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    createCollection = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    getCollection = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    updateCollection = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    deleteCollection = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    addFileToCollection = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    removeFileFromCollection = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    getStorageQuota = asyncHandler(async (req: Request, res: Response) => {
        const statistics = await this.mediaStorageService.getStorageStatistics(req.params.tenantId);
        ResponseUtil.success(res, statistics, 'Storage quota retrieved successfully');
    });

    updateStorageQuota = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    getFileAuditTrail = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });

    getStorageStatistics = asyncHandler(async (req: Request, res: Response) => {
        const statistics = await this.mediaStorageService.getStorageStatistics(req.user?.tenantId);
        ResponseUtil.success(res, statistics, 'Storage statistics retrieved successfully');
    });

    validateSignedUrl = asyncHandler(async (req: Request, res: Response) => {
        ResponseUtil.success(res, { message: 'Not implemented yet' }, 'Feature coming soon');
    });
}