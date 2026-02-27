/**
 * Storage Provider Interface
 * 
 * Abstract interface for different storage backends (S3, Local, etc.)
 */

import { SignedUrlResponse } from '../interfaces';

export interface StorageProvider {
    /**
     * Upload a file to storage
     */
    uploadFile(
        key: string,
        buffer: Buffer,
        mimeType: string,
        metadata?: Record<string, string>
    ): Promise<{
        key: string;
        etag: string;
        size: number;
    }>;

    /**
     * Download a file from storage
     */
    downloadFile(key: string): Promise<{
        buffer: Buffer;
        metadata?: Record<string, string>;
    }>;

    /**
     * Delete a file from storage
     */
    deleteFile(key: string): Promise<void>;

    /**
     * Check if a file exists
     */
    fileExists(key: string): Promise<boolean>;

    /**
     * Get file metadata
     */
    getFileMetadata(key: string): Promise<{
        size: number;
        lastModified: Date;
        etag: string;
        metadata?: Record<string, string>;
    }>;

    /**
     * Generate a signed URL for temporary access
     */
    generateSignedUrl(
        key: string,
        expirationMinutes: number,
        operation: 'get' | 'put',
        options?: {
            contentType?: string;
            contentDisposition?: string;
            downloadFilename?: string;
        }
    ): Promise<SignedUrlResponse>;

    /**
     * Generate a signed URL for multipart upload
     */
    generateMultipartUploadUrl(
        key: string,
        expirationMinutes: number,
        contentType: string
    ): Promise<{
        uploadId: string;
        uploadUrl: string;
        expiresAt: Date;
    }>;

    /**
     * Complete multipart upload
     */
    completeMultipartUpload(
        key: string,
        uploadId: string,
        parts: Array<{
            partNumber: number;
            etag: string;
        }>
    ): Promise<{
        key: string;
        etag: string;
        size: number;
    }>;

    /**
     * Abort multipart upload
     */
    abortMultipartUpload(key: string, uploadId: string): Promise<void>;

    /**
     * Copy a file within storage
     */
    copyFile(sourceKey: string, destinationKey: string): Promise<void>;

    /**
     * List files with prefix
     */
    listFiles(prefix: string, maxKeys?: number): Promise<Array<{
        key: string;
        size: number;
        lastModified: Date;
        etag: string;
    }>>;

    /**
     * Get storage usage for a prefix
     */
    getStorageUsage(prefix: string): Promise<{
        totalFiles: number;
        totalSizeBytes: number;
    }>;
}