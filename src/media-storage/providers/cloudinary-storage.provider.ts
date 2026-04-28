/**
 * Cloudinary Storage Provider
 *
 * Implementation of StorageProvider interface for Cloudinary cloud storage.
 * Used for CMS image uploads and media management.
 *
 * Required Environment Variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { StorageProvider } from './storage-provider.interface';
import { SignedUrlResponse } from '../interfaces';

export class CloudinaryStorageProvider implements StorageProvider {
    private isConfigured = false;

    constructor() {
        this.configure();
    }

    private configure(): void {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            });
            this.isConfigured = true;
        }
    }

    private ensureConfigured(): void {
        if (!this.isConfigured) {
            throw new Error(
                'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
            );
        }
    }

    /**
     * Upload a file buffer to Cloudinary
     */
    async uploadFile(
        key: string,
        buffer: Buffer,
        mimeType: string,
        metadata?: Record<string, string>
    ): Promise<{ key: string; etag: string; size: number }> {
        this.ensureConfigured();

        // Determine resource type from mime
        let resourceType: 'image' | 'video' | 'raw' = 'auto' as any;
        if (mimeType.startsWith('image/')) resourceType = 'image';
        else if (mimeType.startsWith('video/')) resourceType = 'video';
        else resourceType = 'raw';

        // Extract folder from key (e.g., "cms/hero-slides/img1" -> folder: "cms/hero-slides")
        const lastSlash = key.lastIndexOf('/');
        const folder = lastSlash > 0 ? key.substring(0, lastSlash) : 'uploads';
        const publicId = key.replace(/\.[^.]+$/, ''); // Remove file extension

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    folder: folder,
                    resource_type: resourceType,
                    overwrite: true,
                    context: metadata
                        ? Object.entries(metadata).map(([k, v]) => `${k}=${v}`).join('|')
                        : undefined,
                    // Auto-optimize images
                    ...(resourceType === 'image' && {
                        transformation: [
                            { quality: 'auto', fetch_format: 'auto' }
                        ],
                    }),
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error || !result) {
                        return reject(error || new Error('Cloudinary upload failed'));
                    }
                    resolve({
                        key: result.public_id,
                        etag: result.etag || String(result.version),
                        size: result.bytes,
                    });
                }
            );

            uploadStream.end(buffer);
        });
    }

    /**
     * Download a file from Cloudinary
     */
    async downloadFile(key: string): Promise<{ buffer: Buffer; metadata?: Record<string, string> }> {
        this.ensureConfigured();

        const url = cloudinary.url(key, { secure: true, resource_type: 'auto' });
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer) };
    }

    /**
     * Delete a file from Cloudinary
     */
    async deleteFile(key: string): Promise<void> {
        this.ensureConfigured();

        try {
            await cloudinary.uploader.destroy(key, { invalidate: true });
        } catch (error) {
            // Try with different resource types
            try {
                await cloudinary.uploader.destroy(key, { resource_type: 'video', invalidate: true });
            } catch {
                await cloudinary.uploader.destroy(key, { resource_type: 'raw', invalidate: true });
            }
        }
    }

    /**
     * Check if file exists in Cloudinary
     */
    async fileExists(key: string): Promise<boolean> {
        this.ensureConfigured();

        try {
            await cloudinary.api.resource(key);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get file metadata from Cloudinary
     */
    async getFileMetadata(key: string): Promise<{
        size: number;
        lastModified: Date;
        etag: string;
        metadata?: Record<string, string>;
    }> {
        this.ensureConfigured();

        const result = await cloudinary.api.resource(key, { context: true });
        const contextMeta: Record<string, string> = {};
        if (result.context?.custom) {
            Object.entries(result.context.custom).forEach(([k, v]) => {
                contextMeta[k] = String(v);
            });
        }

        return {
            size: result.bytes,
            lastModified: new Date(result.created_at),
            etag: String(result.version),
            metadata: contextMeta,
        };
    }

    /**
     * Generate a signed/secure URL for temporary access
     */
    async generateSignedUrl(
        key: string,
        expirationMinutes: number,
        operation: 'get' | 'put',
        options?: {
            contentType?: string;
            contentDisposition?: string;
            downloadFilename?: string;
        }
    ): Promise<SignedUrlResponse> {
        this.ensureConfigured();

        const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
        const timestamp = Math.floor(expiresAt.getTime() / 1000);

        if (operation === 'get') {
            // For downloads, generate a signed URL with expiration
            const urlOptions: any = {
                secure: true,
                sign_url: true,
                type: 'authenticated',
                expires_at: timestamp,
                resource_type: 'auto',
            };

            if (options?.downloadFilename) {
                urlOptions.flags = `attachment:${options.downloadFilename}`;
            }

            const url = cloudinary.url(key, urlOptions);
            return { url, expiresAt };
        }

        // For uploads, return the regular secure URL
        const url = cloudinary.url(key, { secure: true, resource_type: 'auto' });
        return { url, expiresAt };
    }

    /**
     * Generate multipart upload URL (Cloudinary handles chunking internally)
     */
    async generateMultipartUploadUrl(
        key: string,
        expirationMinutes: number,
        contentType: string
    ): Promise<{ uploadId: string; uploadUrl: string; expiresAt: Date }> {
        this.ensureConfigured();

        const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

        // Determine resource type
        let resourceType = 'auto';
        if (contentType.startsWith('image/')) resourceType = 'image';
        else if (contentType.startsWith('video/')) resourceType = 'video';

        return {
            uploadId: `cloudinary_multipart_${Date.now()}`,
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            expiresAt,
        };
    }

    /**
     * Complete multipart upload (no-op for Cloudinary - handled automatically)
     */
    async completeMultipartUpload(
        key: string,
        uploadId: string,
        parts: Array<{ partNumber: number; etag: string }>
    ): Promise<{ key: string; etag: string; size: number }> {
        return { key, etag: uploadId, size: 0 };
    }

    /**
     * Abort multipart upload (no-op for Cloudinary)
     */
    async abortMultipartUpload(_key: string, _uploadId: string): Promise<void> {
        // Cloudinary doesn't have explicit multipart abort
    }

    /**
     * Copy/rename a file in Cloudinary
     */
    async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
        this.ensureConfigured();

        // Cloudinary doesn't have a direct copy. Upload from URL instead.
        const sourceUrl = cloudinary.url(sourceKey, { secure: true, resource_type: 'auto' });
        await cloudinary.uploader.upload(sourceUrl, {
            public_id: destinationKey,
            resource_type: 'auto',
        });
    }

    /**
     * List files with a given prefix
     */
    async listFiles(prefix: string, maxKeys?: number): Promise<Array<{
        key: string;
        size: number;
        lastModified: Date;
        etag: string;
    }>> {
        this.ensureConfigured();

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: prefix,
            max_results: maxKeys || 100,
            resource_type: 'image',
        });

        return result.resources.map((r: any) => ({
            key: r.public_id,
            size: r.bytes,
            lastModified: new Date(r.created_at),
            etag: String(r.version),
        }));
    }

    /**
     * Get total storage usage for a prefix
     */
    async getStorageUsage(prefix: string): Promise<{ totalFiles: number; totalSizeBytes: number }> {
        const files = await this.listFiles(prefix, 500);
        return {
            totalFiles: files.length,
            totalSizeBytes: files.reduce((sum, f) => sum + f.size, 0),
        };
    }

    /**
     * Helper: Get the public secure URL for a Cloudinary resource
     */
    getPublicUrl(publicId: string, options?: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string | number;
        format?: string;
    }): string {
        this.ensureConfigured();

        const transformation: any[] = [];
        if (options?.width || options?.height) {
            transformation.push({
                width: options.width,
                height: options.height,
                crop: options.crop || 'fill',
            });
        }
        if (options?.quality) {
            transformation.push({ quality: options.quality });
        }
        if (options?.format) {
            transformation.push({ fetch_format: options.format });
        }

        return cloudinary.url(publicId, {
            secure: true,
            transformation: transformation.length > 0 ? transformation : undefined,
        });
    }
}
