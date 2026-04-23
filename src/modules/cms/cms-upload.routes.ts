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

// Middleware: check if Cloudinary is configured
const checkCloudinaryConfig = (_req: Request, _res: Response, next: Function) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new AppError(
            'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
            HTTP_STATUS.SERVICE_UNAVAILABLE
        );
    }
    next();
};

const adminRoles = [UserRole.ADMIN, UserRole.REGIONAL_ADMIN, UserRole.LOCATION_MANAGER];

// =============================================
// POST /upload-image - Upload single image
// =============================================
router.post(
    '/upload-image',
    authenticate,
    authorize(...adminRoles),
    checkCloudinaryConfig,
    upload.single('image'),
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No image file provided. Send as form-data with key "image".', HTTP_STATUS.BAD_REQUEST);
        }

        // Folder defaults to "cms" but can be customized per content type
        const folder = `proactiv/${(req.body.folder as string) || 'cms'}`;

        const result = await uploadToCloudinary(req.file.buffer, {
            folder,
            resourceType: 'image',
        });

        ResponseUtil.success(res, {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
            originalName: req.file.originalname,
        }, 'Image uploaded successfully');
    })
);

// =============================================
// POST /upload-images - Upload multiple images (max 10)
// =============================================
router.post(
    '/upload-images',
    authenticate,
    authorize(...adminRoles),
    checkCloudinaryConfig,
    upload.array('images', 10),
    asyncHandler(async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new AppError('No image files provided. Send as form-data with key "images".', HTTP_STATUS.BAD_REQUEST);
        }

        const folder = `proactiv/${(req.body.folder as string) || 'cms'}`;

        // Upload all files in parallel
        const results = await Promise.all(
            files.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, {
                    folder,
                    resourceType: 'image',
                });
                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    size: result.bytes,
                    originalName: file.originalname,
                };
            })
        );

        ResponseUtil.success(res, results, `${results.length} images uploaded successfully`);
    })
);

// =============================================
// DELETE /delete-image - Delete an image by publicId
// =============================================
router.delete(
    '/delete-image',
    authenticate,
    authorize(...adminRoles),
    checkCloudinaryConfig,
    asyncHandler(async (req: Request, res: Response) => {
        const { publicId } = req.body;

        if (!publicId) {
            throw new AppError('publicId is required in request body', HTTP_STATUS.BAD_REQUEST);
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
