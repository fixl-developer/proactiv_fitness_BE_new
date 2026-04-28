/**
 * CMS Media Upload Routes
 *
 * Handles image uploads for CMS content via Cloudinary.
 * All routes require admin authentication.
 *
 * Endpoints:
 *   POST /upload-image      - Upload single image
 *   POST /upload-images     - Upload multiple images (max 10)
 *   DELETE /delete-image     - Delete an image by publicId
 *
 * Required ENV:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate, authorize } from '../iam/auth.middleware';
import { UserRole } from '../../shared/enums';
import { asyncHandler } from '../../shared/utils/async-handler.util';
import { ResponseUtil } from '../../shared/utils/response.util';
import { AppError } from '../../shared/utils/app-error.util';
import { HTTP_STATUS } from '../../shared/constants';

// =============================================
// CLOUDINARY CONFIGURATION
// =============================================
// Reads from environment variables - works locally AND on Render/production
// Just add these 3 env vars in Render dashboard:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// =============================================
// MULTER CONFIGURATION
// =============================================
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
        }
    },
});

// =============================================
// HELPER: Upload buffer to Cloudinary
// =============================================
function uploadToCloudinary(
    buffer: Buffer,
    options: {
        folder: string;
        publicId?: string;
        resourceType?: 'image' | 'video' | 'raw' | 'auto';
    }
): Promise<any> {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: options.folder,
            resource_type: options.resourceType || 'image',
            overwrite: true,
            // Auto-optimize: compress + convert to best format
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
            ],
        };

        if (options.publicId) {
            uploadOptions.public_id = options.publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(new AppError(
                        `Cloudinary upload failed: ${error.message}`,
                        HTTP_STATUS.INTERNAL_SERVER_ERROR
                    ));
                } else if (!result) {
                    reject(new AppError('Cloudinary upload returned no result', HTTP_STATUS.INTERNAL_SERVER_ERROR));
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(buffer);
    });
}

// =============================================
// ROUTES
// =============================================
const router = Router();

// Returns true if Cloudinary env vars are configured
const isCloudinaryConfigured = (): boolean =>
    !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

// Fallback: encode the file as a base64 data URL so uploads still work when
// Cloudinary isn't configured (e.g. on a free Render dyno without env vars).
// Capped at MAX_DATA_URL_BYTES because data URLs in MongoDB inflate ~33% and
// hero-slide collections shouldn't carry multi-MB blobs.
const MAX_DATA_URL_BYTES = 2 * 1024 * 1024; // 2MB raw -> ~2.7MB base64
function fileToDataUrl(file: Express.Multer.File): string {
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
}

const adminRoles = [UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER];

// =============================================
// POST /upload-image - Upload single image
// =============================================
router.post(
    '/upload-image',
    authenticate,
    authorize(...adminRoles),
    upload.single('image'),
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No image file provided. Send as form-data with key "image".', HTTP_STATUS.BAD_REQUEST);
        }

        // Cloudinary path — if configured, try it first. On failure (invalid creds,
        // network error, etc.) fall back to inline base64 so admin uploads still work.
        if (isCloudinaryConfigured()) {
            try {
                const folder = `proactiv/${(req.body.folder as string) || 'cms'}`;
                const result = await uploadToCloudinary(req.file.buffer, { folder, resourceType: 'image' });
                ResponseUtil.success(res, {
                    url: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    size: result.bytes,
                    originalName: req.file.originalname,
                    storage: 'cloudinary',
                }, 'Image uploaded successfully');
                return;
            } catch (cloudErr: any) {
                // Cloudinary refused — log and fall through to base64 below.
                // Common cause: invalid CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in .env.
                console.warn(
                    '[cms-upload] Cloudinary upload failed, falling back to inline base64:',
                    cloudErr?.message || cloudErr
                );
            }
        }

        // Fallback: inline base64 data URL
        if (req.file.size > MAX_DATA_URL_BYTES) {
            throw new AppError(
                `Image too large for inline storage (${(req.file.size / 1024 / 1024).toFixed(1)}MB). ` +
                `Limit is ${MAX_DATA_URL_BYTES / 1024 / 1024}MB when Cloudinary isn't available. ` +
                `Either compress the image or fix Cloudinary credentials (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET).`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
        const url = fileToDataUrl(req.file);
        ResponseUtil.success(res, {
            url,
            publicId: null,
            size: req.file.size,
            format: req.file.mimetype.replace('image/', ''),
            originalName: req.file.originalname,
            storage: 'inline-base64',
        }, 'Image uploaded successfully (inline base64 — configure Cloudinary for production)');
    })
);

// =============================================
// POST /upload-images - Upload multiple images (max 10)
// =============================================
router.post(
    '/upload-images',
    authenticate,
    authorize(...adminRoles),
    upload.array('images', 10),
    asyncHandler(async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new AppError('No image files provided. Send as form-data with key "images".', HTTP_STATUS.BAD_REQUEST);
        }

        if (isCloudinaryConfigured()) {
            try {
                const folder = `proactiv/${(req.body.folder as string) || 'cms'}`;
                const results = await Promise.all(
                    files.map(async (file) => {
                        const result = await uploadToCloudinary(file.buffer, { folder, resourceType: 'image' });
                        return {
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            size: result.bytes,
                            originalName: file.originalname,
                            storage: 'cloudinary',
                        };
                    })
                );
                ResponseUtil.success(res, results, `${results.length} images uploaded successfully`);
                return;
            } catch (cloudErr: any) {
                console.warn(
                    '[cms-upload] Cloudinary multi-upload failed, falling back to inline base64:',
                    cloudErr?.message || cloudErr
                );
            }
        }

        // Fallback: inline base64 for each
        const tooBig = files.find(f => f.size > MAX_DATA_URL_BYTES);
        if (tooBig) {
            throw new AppError(
                `One or more images exceed the ${MAX_DATA_URL_BYTES / 1024 / 1024}MB inline limit. ` +
                `Configure Cloudinary or compress the images.`,
                HTTP_STATUS.BAD_REQUEST
            );
        }
        const results = files.map((file) => ({
            url: fileToDataUrl(file),
            publicId: null,
            size: file.size,
            format: file.mimetype.replace('image/', ''),
            originalName: file.originalname,
            storage: 'inline-base64',
        }));
        ResponseUtil.success(res, results, `${results.length} images uploaded (inline base64)`);
    })
);

// =============================================
// DELETE /delete-image - Delete an image by publicId
// =============================================
router.delete(
    '/delete-image',
    authenticate,
    authorize(...adminRoles),
    asyncHandler(async (req: Request, res: Response) => {
        const { publicId } = req.body;

        if (!publicId) {
            // Inline base64 images have no publicId — nothing to delete on the storage side.
            ResponseUtil.success(res, { publicId: null, result: 'noop' }, 'Inline image — nothing to delete');
            return;
        }

        if (!isCloudinaryConfigured()) {
            // Cloudinary off but a publicId was sent — treat as orphan, no-op.
            ResponseUtil.success(res, { publicId, result: 'noop' }, 'Cloudinary not configured — nothing to delete');
            return;
        }

        // Destroy image from Cloudinary + invalidate CDN cache
        const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });

        if (result.result === 'ok' || result.result === 'not found') {
            ResponseUtil.success(res, { publicId, result: result.result }, 'Image deleted successfully');
        } else {
            throw new AppError(`Failed to delete image: ${result.result}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    })
);

// =============================================
// GET /config-status - Check if Cloudinary is configured
// =============================================
router.get(
    '/config-status',
    authenticate,
    authorize(...adminRoles),
    asyncHandler(async (_req: Request, res: Response) => {
        const isConfigured = !!(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        );

        let usage = null;
        if (isConfigured) {
            try {
                const accountInfo = await cloudinary.api.usage();
                usage = {
                    storageBytesUsed: accountInfo.storage?.usage || 0,
                    storageLimit: accountInfo.storage?.limit || 0,
                    bandwidthBytesUsed: accountInfo.bandwidth?.usage || 0,
                    bandwidthLimit: accountInfo.bandwidth?.limit || 0,
                    transformationsUsed: accountInfo.transformations?.usage || 0,
                    transformationsLimit: accountInfo.transformations?.limit || 0,
                };
            } catch {
                // Silently fail - credentials might be invalid
            }
        }

        ResponseUtil.success(res, {
            isConfigured,
            cloudName: isConfigured ? process.env.CLOUDINARY_CLOUD_NAME : null,
            usage,
        }, isConfigured ? 'Cloudinary is configured' : 'Cloudinary is NOT configured');
    })
);

export default router;
