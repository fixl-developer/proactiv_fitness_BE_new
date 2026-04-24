/**
 * Media Storage Routes
 * 
 * Express routes for media upload, download, and management
 */

import { Router } from 'express';
import { MediaStorageController } from '../controllers/media-storage.controller';
import { authenticate, authorize } from '../../modules/iam/auth.middleware';
import { rateLimitMiddleware } from '../../middleware/rate-limit.middleware';
import { validationMiddleware } from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enums';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
});

export function createMediaStorageRoutes(controller: MediaStorageController): Router {
    const router = Router();

    // Apply authentication to all routes
    router.use(authenticate);

    // Apply rate limiting
    router.use(rateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // 500 requests per window
        message: 'Too many media requests'
    }));

    // File upload endpoints
    router.post('/upload', upload.single('file'), controller.uploadFile);
    router.post('/upload-multiple', upload.array('files', 10), controller.uploadMultipleFiles);
    router.post('/upload-session', controller.createUploadSession);
    router.put('/upload-session/:sessionId', controller.completeUpload);
    router.delete('/upload-session/:sessionId', controller.cancelUpload);

    // File access endpoints
    router.get('/:fileId/signed-url', controller.generateSignedUrl);
    router.get('/:fileId/metadata', controller.getFileMetadata);
    router.get('/:fileId/thumbnail/:size', controller.getThumbnailSignedUrl);

    // File management endpoints
    router.get('/search', controller.searchFiles);
    router.put('/:fileId/metadata', controller.updateMetadata);
    router.put('/:fileId/consent', controller.updateConsentStatus);
    router.delete('/:fileId', controller.deleteFile);
    router.post('/:fileId/restore', controller.restoreFile);

    // Document versioning endpoints
    router.get('/:fileId/versions', controller.getFileVersions);
    router.get('/:fileId/versions/:version', controller.getFileVersion);
    router.post('/:fileId/versions', upload.single('file'), controller.createFileVersion);

    // Collection management endpoints
    router.post('/collections', controller.createCollection);
    router.get('/collections/:collectionId', controller.getCollection);
    router.put('/collections/:collectionId', controller.updateCollection);
    router.delete('/collections/:collectionId', controller.deleteCollection);
    router.post('/collections/:collectionId/files', controller.addFileToCollection);
    router.delete('/collections/:collectionId/files/:fileId', controller.removeFileFromCollection);

    // Admin endpoints
    router.get('/quota/:tenantId',
        authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
        controller.getStorageQuota
    );
    router.put('/quota/:tenantId',
        authorize(UserRole.ADMIN),
        controller.updateStorageQuota
    );
    router.get('/audit/:fileId',
        authorize(UserRole.ADMIN, UserRole.REGIONAL_ADMIN),
        controller.getFileAuditTrail
    );

    // Statistics endpoints
    router.get('/statistics', controller.getStorageStatistics);
    router.get('/health', controller.healthCheck);

    // Signed URL validation (for local storage)
    router.get('/signed/:token', controller.validateSignedUrl);

    return router;
}