/**
 * Local Storage Provider
 * 
 * Implementation of StorageProvider interface for local filesystem storage.
 * Used primarily for development and testing.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageProvider } from './storage-provider.interface';
import { SignedUrlResponse } from '../interfaces';
import { Logger } from '../../shared/utils/logger.util';
import { AppError } from '../../shared/utils/app-error.util';
import { createHash } from 'crypto';

export class LocalStorageProvider implements StorageProvider {
    private logger = Logger.getInstance();
    private signedUrls = new Map<string, { expiresAt: Date; key: string }>();

    constructor(private basePath: string) {
        this.ensureBasePathExists();
        this.startCleanupTimer();
    }

    private async ensureBasePathExists(): Promise<void> {
        try {
            await fs.mkdir(this.basePath, { recursive: true });
        } catch (error) {
            this.logger.error('Error creating base storage path:', error);
            throw new AppError('Failed to initialize local storage', 500);
        }
    }

    private getFullPath(key: string): string {
        return path.join(this.basePath, key);
    }

    private async ensureDirectoryExists(filePath: string): Promise<void> {
        const dir = path.dirname(filePath);
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            this.logger.error(`Error creating directory: ${dir}`, error);
            throw new AppError('Failed to create directory', 500);
        }
    }

    async uploadFile(
        key: string,
        buffer: Buffer,
        mimeType: string,
        metadata?: Record<string, string>
    ): Promise<{ key: string; etag: string; size: number }> {
        try {
            const fullPath = this.getFullPath(key);
            await this.ensureDirectoryExists(fullPath);

            await fs.writeFile(fullPath, buffer);

            // Store metadata in a separate file
            if (metadata) {
                const metadataPath = `${fullPath}.metadata`;
                await fs.writeFile(metadataPath, JSON.stringify({
                    ...metadata,
                    contentType: mimeType,
                    uploadedAt: new Date().toISOString()
                }));
            }

            // Generate etag (MD5 hash)
            const etag = createHash('md5').update(buffer).digest('hex');

            return {
                key,
                etag,
                size: buffer.length
            };
        } catch (error) {
            this.logger.error(`Error uploading file to local storage: ${key}`, error);
            throw new AppError('Failed to upload file to storage', 500);
        }
    }

    async downloadFile(key: string): Promise<{ buffer: Buffer; metadata?: Record<string, string> }> {
        try {
            const fullPath = this.getFullPath(key);

            // Check if file exists
            try {
                await fs.access(fullPath);
            } catch {
                throw new AppError('File not found', 404);
            }

            const buffer = await fs.readFile(fullPath);

            // Try to read metadata
            let metadata: Record<string, string> | undefined;
            try {
                const metadataPath = `${fullPath}.metadata`;
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                metadata = JSON.parse(metadataContent);
            } catch {
                // Metadata file doesn't exist or is invalid
            }

            return {
                buffer,
                metadata
            };
        } catch (error) {
            this.logger.error(`Error downloading file from local storage: ${key}`, error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to download file from storage', 500);
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(key);

            // Delete main file
            try {
                await fs.unlink(fullPath);
            } catch (error: any) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }

            // Delete metadata file
            try {
                await fs.unlink(`${fullPath}.metadata`);
            } catch {
                // Metadata file might not exist
            }
        } catch (error) {
            this.logger.error(`Error deleting file from local storage: ${key}`, error);
            throw new AppError('Failed to delete file from storage', 500);
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const fullPath = this.getFullPath(key);
            await fs.access(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    async getFileMetadata(key: string): Promise<{
        size: number;
        lastModified: Date;
        etag: string;
        metadata?: Record<string, string>;
    }> {
        try {
            const fullPath = this.getFullPath(key);
            const stats = await fs.stat(fullPath);

            // Generate etag from file content
            const buffer = await fs.readFile(fullPath);
            const etag = createHash('md5').update(buffer).digest('hex');

            // Try to read metadata
            let metadata: Record<string, string> | undefined;
            try {
                const metadataPath = `${fullPath}.metadata`;
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                metadata = JSON.parse(metadataContent);
            } catch {
                // Metadata file doesn't exist or is invalid
            }

            return {
                size: stats.size,
                lastModified: stats.mtime,
                etag,
                metadata
            };
        } catch (error) {
            this.logger.error(`Error getting file metadata from local storage: ${key}`, error);
            throw new AppError('Failed to get file metadata', 500);
        }
    }

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
        try {
            const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
            const token = createHash('sha256')
                .update(`${key}:${expiresAt.getTime()}:${operation}`)
                .digest('hex');

            // Store the signed URL mapping
            this.signedUrls.set(token, { expiresAt, key });

            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            const url = `${baseUrl}/api/media/signed/${token}`;

            const headers: Record<string, string> = {};
            if (options?.contentType) {
                headers['Content-Type'] = options.contentType;
            }

            return {
                url,
                expiresAt,
                headers: Object.keys(headers).length > 0 ? headers : undefined
            };
        } catch (error) {
            this.logger.error(`Error generating signed URL for local storage: ${key}`, error);
            throw new AppError('Failed to generate signed URL', 500);
        }
    }

    async generateMultipartUploadUrl(
        key: string,
        expirationMinutes: number,
        contentType: string
    ): Promise<{
        uploadId: string;
        uploadUrl: string;
        expiresAt: Date;
    }> {
        // For local storage, we'll simulate multipart upload with a regular upload
        const uploadId = createHash('sha256').update(`${key}:${Date.now()}`).digest('hex');
        const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

        const signedUrl = await this.generateSignedUrl(key, expirationMinutes, 'put', {
            contentType
        });

        return {
            uploadId,
            uploadUrl: signedUrl.url,
            expiresAt
        };
    }

    async completeMultipartUpload(
        key: string,
        uploadId: string,
        parts: Array<{ partNumber: number; etag: string }>
    ): Promise<{ key: string; etag: string; size: number }> {
        // For local storage, the file should already be uploaded
        const metadata = await this.getFileMetadata(key);

        return {
            key,
            etag: metadata.etag,
            size: metadata.size
        };
    }

    async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
        // For local storage, just delete the file if it exists
        if (await this.fileExists(key)) {
            await this.deleteFile(key);
        }
    }

    async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
        try {
            const sourcePath = this.getFullPath(sourceKey);
            const destPath = this.getFullPath(destinationKey);

            await this.ensureDirectoryExists(destPath);
            await fs.copyFile(sourcePath, destPath);

            // Copy metadata file if it exists
            try {
                await fs.copyFile(`${sourcePath}.metadata`, `${destPath}.metadata`);
            } catch {
                // Metadata file might not exist
            }
        } catch (error) {
            this.logger.error(`Error copying file in local storage: ${sourceKey} -> ${destinationKey}`, error);
            throw new AppError('Failed to copy file', 500);
        }
    }

    async listFiles(prefix: string, maxKeys = 1000): Promise<Array<{
        key: string;
        size: number;
        lastModified: Date;
        etag: string;
    }>> {
        try {
            const prefixPath = this.getFullPath(prefix);
            const files: Array<{
                key: string;
                size: number;
                lastModified: Date;
                etag: string;
            }> = [];

            const walkDir = async (dir: string, currentPrefix: string): Promise<void> => {
                try {
                    const entries = await fs.readdir(dir, { withFileTypes: true });

                    for (const entry of entries) {
                        if (files.length >= maxKeys) break;

                        const fullPath = path.join(dir, entry.name);
                        const relativePath = path.join(currentPrefix, entry.name);

                        if (entry.isDirectory()) {
                            await walkDir(fullPath, relativePath);
                        } else if (entry.isFile() && !entry.name.endsWith('.metadata')) {
                            const stats = await fs.stat(fullPath);
                            const buffer = await fs.readFile(fullPath);
                            const etag = createHash('md5').update(buffer).digest('hex');

                            files.push({
                                key: relativePath.replace(/\\/g, '/'), // Normalize path separators
                                size: stats.size,
                                lastModified: stats.mtime,
                                etag
                            });
                        }
                    }
                } catch (error: any) {
                    if (error.code !== 'ENOENT') {
                        throw error;
                    }
                }
            };

            await walkDir(path.dirname(prefixPath), prefix);
            return files;
        } catch (error) {
            this.logger.error(`Error listing files in local storage with prefix: ${prefix}`, error);
            throw new AppError('Failed to list files', 500);
        }
    }

    async getStorageUsage(prefix: string): Promise<{
        totalFiles: number;
        totalSizeBytes: number;
    }> {
        try {
            const files = await this.listFiles(prefix, Number.MAX_SAFE_INTEGER);

            return {
                totalFiles: files.length,
                totalSizeBytes: files.reduce((sum, file) => sum + file.size, 0)
            };
        } catch (error) {
            this.logger.error(`Error getting storage usage for local storage prefix: ${prefix}`, error);
            throw new AppError('Failed to get storage usage', 500);
        }
    }

    /**
     * Validate and serve a signed URL (for local storage)
     */
    async validateSignedUrl(token: string): Promise<{ key: string; isValid: boolean }> {
        const urlInfo = this.signedUrls.get(token);

        if (!urlInfo) {
            return { key: '', isValid: false };
        }

        if (new Date() > urlInfo.expiresAt) {
            this.signedUrls.delete(token);
            return { key: '', isValid: false };
        }

        return { key: urlInfo.key, isValid: true };
    }

    /**
     * Start cleanup timer for expired signed URLs
     */
    private startCleanupTimer(): void {
        setInterval(() => {
            const now = new Date();
            for (const [token, urlInfo] of this.signedUrls.entries()) {
                if (now > urlInfo.expiresAt) {
                    this.signedUrls.delete(token);
                }
            }
        }, 5 * 60 * 1000); // Clean up every 5 minutes
    }
}