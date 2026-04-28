/**
 * S3 Storage Provider
 * 
 * Implementation of StorageProvider interface for AWS S3 and S3-compatible services.
 */

import { StorageProvider } from './storage-provider.interface';
import { SignedUrlResponse } from '../interfaces';
import { Logger } from '../../shared/utils/logger.util';
import { AppError } from '../../shared/utils/app-error.util';

// Optional imports for AWS SDK
let S3Client: any;
let PutObjectCommand: any;
let GetObjectCommand: any;
let DeleteObjectCommand: any;
let HeadObjectCommand: any;
let ListObjectsV2Command: any;
let CreateMultipartUploadCommand: any;
let CompleteMultipartUploadCommand: any;
let AbortMultipartUploadCommand: any;
let CopyObjectCommand: any;
let getSignedUrl: any;

try {
    const awsSdk = require('@aws-sdk/client-s3');
    S3Client = awsSdk.S3Client;
    PutObjectCommand = awsSdk.PutObjectCommand;
    GetObjectCommand = awsSdk.GetObjectCommand;
    DeleteObjectCommand = awsSdk.DeleteObjectCommand;
    HeadObjectCommand = awsSdk.HeadObjectCommand;
    ListObjectsV2Command = awsSdk.ListObjectsV2Command;
    CreateMultipartUploadCommand = awsSdk.CreateMultipartUploadCommand;
    CompleteMultipartUploadCommand = awsSdk.CompleteMultipartUploadCommand;
    AbortMultipartUploadCommand = awsSdk.AbortMultipartUploadCommand;
    CopyObjectCommand = awsSdk.CopyObjectCommand;

    const presigner = require('@aws-sdk/s3-request-presigner');
    getSignedUrl = presigner.getSignedUrl;
} catch (error) {
    Logger.warn('AWS SDK not available, S3 storage provider will not work');
}

export class S3StorageProvider implements StorageProvider {
    private logger = Logger.getInstance();

    constructor(
        private s3Client: any,
        private bucketName: string,
        private region: string
    ) { }

    async uploadFile(
        key: string,
        buffer: Buffer,
        mimeType: string,
        metadata?: Record<string, string>
    ): Promise<{ key: string; etag: string; size: number }> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                Metadata: metadata
            });

            const result = await this.s3Client.send(command);

            return {
                key,
                etag: result.ETag || '',
                size: buffer.length
            };
        } catch (error) {
            this.logger.error(`Error uploading file to S3: ${key}`, error);
            throw new AppError('Failed to upload file to storage', 500);
        }
    }

    async downloadFile(key: string): Promise<{ buffer: Buffer; metadata?: Record<string, string> }> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);

            if (!result.Body) {
                throw new AppError('File not found', 404);
            }

            const buffer = Buffer.from(await result.Body.transformToByteArray());

            return {
                buffer,
                metadata: result.Metadata
            };
        } catch (error) {
            this.logger.error(`Error downloading file from S3: ${key}`, error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to download file from storage', 500);
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Error deleting file from S3: ${key}`, error);
            throw new AppError('Failed to delete file from storage', 500);
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                return false;
            }
            this.logger.error(`Error checking file existence in S3: ${key}`, error);
            throw new AppError('Failed to check file existence', 500);
        }
    }

    async getFileMetadata(key: string): Promise<{
        size: number;
        lastModified: Date;
        etag: string;
        metadata?: Record<string, string>;
    }> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            const result = await this.s3Client.send(command);

            return {
                size: result.ContentLength || 0,
                lastModified: result.LastModified || new Date(),
                etag: result.ETag || '',
                metadata: result.Metadata
            };
        } catch (error) {
            this.logger.error(`Error getting file metadata from S3: ${key}`, error);
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
            const expiresIn = expirationMinutes * 60; // Convert to seconds
            const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

            let command;
            const headers: Record<string, string> = {};

            if (operation === 'get') {
                const commandParams: any = {
                    Bucket: this.bucketName,
                    Key: key
                };

                if (options?.contentDisposition || options?.downloadFilename) {
                    const disposition = options.contentDisposition || 'attachment';
                    const filename = options.downloadFilename || key.split('/').pop();
                    commandParams.ResponseContentDisposition = `${disposition}; filename="${filename}"`;
                }

                command = new GetObjectCommand(commandParams);
            } else {
                const commandParams: any = {
                    Bucket: this.bucketName,
                    Key: key
                };

                if (options?.contentType) {
                    commandParams.ContentType = options.contentType;
                    headers['Content-Type'] = options.contentType;
                }

                command = new PutObjectCommand(commandParams);
            }

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });

            return {
                url,
                expiresAt,
                headers: Object.keys(headers).length > 0 ? headers : undefined
            };
        } catch (error) {
            this.logger.error(`Error generating signed URL for S3: ${key}`, error);
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
        try {
            const command = new CreateMultipartUploadCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType
            });

            const result = await this.s3Client.send(command);

            if (!result.UploadId) {
                throw new AppError('Failed to create multipart upload', 500);
            }

            const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

            return {
                uploadId: result.UploadId,
                uploadUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
                expiresAt
            };
        } catch (error) {
            this.logger.error(`Error creating multipart upload for S3: ${key}`, error);
            throw new AppError('Failed to create multipart upload', 500);
        }
    }

    async completeMultipartUpload(
        key: string,
        uploadId: string,
        parts: Array<{ partNumber: number; etag: string }>
    ): Promise<{ key: string; etag: string; size: number }> {
        try {
            const command = new CompleteMultipartUploadCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts.map(part => ({
                        ETag: part.etag,
                        PartNumber: part.partNumber
                    }))
                }
            });

            const result = await this.s3Client.send(command);

            // Get file size after completion
            const metadata = await this.getFileMetadata(key);

            return {
                key,
                etag: result.ETag || '',
                size: metadata.size
            };
        } catch (error) {
            this.logger.error(`Error completing multipart upload for S3: ${key}`, error);
            throw new AppError('Failed to complete multipart upload', 500);
        }
    }

    async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
        try {
            const command = new AbortMultipartUploadCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId
            });

            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Error aborting multipart upload for S3: ${key}`, error);
            throw new AppError('Failed to abort multipart upload', 500);
        }
    }

    async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
        try {
            const command = new CopyObjectCommand({
                Bucket: this.bucketName,
                CopySource: `${this.bucketName}/${sourceKey}`,
                Key: destinationKey
            });

            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Error copying file in S3: ${sourceKey} -> ${destinationKey}`, error);
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
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys
            });

            const result = await this.s3Client.send(command);

            return (result.Contents || []).map(obj => ({
                key: obj.Key || '',
                size: obj.Size || 0,
                lastModified: obj.LastModified || new Date(),
                etag: obj.ETag || ''
            }));
        } catch (error) {
            this.logger.error(`Error listing files in S3 with prefix: ${prefix}`, error);
            throw new AppError('Failed to list files', 500);
        }
    }

    async getStorageUsage(prefix: string): Promise<{
        totalFiles: number;
        totalSizeBytes: number;
    }> {
        try {
            let totalFiles = 0;
            let totalSizeBytes = 0;
            let continuationToken: string | undefined;

            do {
                const command = new ListObjectsV2Command({
                    Bucket: this.bucketName,
                    Prefix: prefix,
                    MaxKeys: 1000,
                    ContinuationToken: continuationToken
                });

                const result = await this.s3Client.send(command);

                if (result.Contents) {
                    totalFiles += result.Contents.length;
                    totalSizeBytes += result.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
                }

                continuationToken = result.NextContinuationToken;
            } while (continuationToken);

            return {
                totalFiles,
                totalSizeBytes
            };
        } catch (error) {
            this.logger.error(`Error getting storage usage for S3 prefix: ${prefix}`, error);
            throw new AppError('Failed to get storage usage', 500);
        }
    }
}