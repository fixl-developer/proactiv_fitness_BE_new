import sharp from 'sharp';
import { Db } from 'mongodb';
import { StorageProvider } from '../providers/storage-provider.interface';
import logger from '../../shared/utils/logger.util';

export interface ThumbnailConfig {
    width: number;
    height: number;
    quality: number;
    format: 'jpeg' | 'png' | 'webp';
}

export interface ThumbnailVariant {
    name: string;
    config: ThumbnailConfig;
}

export interface ThumbnailResult {
    thumbnailId: string;
    variant: string;
    width: number;
    height: number;
    fileSize: number;
    storagePath: string;
    mimeType: string;
}

/**
 * Thumbnail Generation Service
 */
export class ThumbnailService {
    private db: Db;
    private storageProvider: StorageProvider;
    private variants: Map<string, ThumbnailConfig>;

    constructor(db: Db, storageProvider: StorageProvider) {
        this.db = db;
        this.storageProvider = storageProvider;
        this.variants = new Map();

        // Initialize default thumbnail variants
        this.initializeDefaultVariants();
    }

    /**
     * Generate thumbnails for an image
     */
    async generateThumbnails(
        fileId: string,
        originalBuffer: Buffer,
        tenantId: string,
        variants?: string[]
    ): Promise<ThumbnailResult[]> {
        const variantsToGenerate = variants || Array.from(this.variants.keys());
        const results: ThumbnailResult[] = [];

        try {
            // Check if the image is valid
            const image = sharp(originalBuffer);
            const metadata = await image.metadata();

            if (!metadata.width || !metadata.height) {
                throw new Error('Invalid image metadata');
            }

            logger.debug('Generating thumbnails:', {
                fileId,
                originalSize: { width: metadata.width, height: metadata.height },
                variants: variantsToGenerate
            });

            // Generate each thumbnail variant
            for (const variantName of variantsToGenerate) {
                const config = this.variants.get(variantName);
                if (!config) {
                    logger.warn(`Unknown thumbnail variant: ${variantName}`);
                    continue;
                }

                try {
                    const result = await this.generateThumbnail(
                        fileId,
                        originalBuffer,
                        tenantId,
                        variantName,
                        config
                    );
                    results.push(result);
                } catch (error) {
                    logger.error(`Failed to generate thumbnail variant ${variantName}:`, error);
                }
            }

            // Save thumbnail records to database
            if (results.length > 0) {
                await this.saveThumbnailRecords(fileId, tenantId, results);
            }

            logger.info(`Generated ${results.length} thumbnails for file ${fileId}`);
            return results;
        } catch (error) {
            logger.error('Thumbnail generation failed:', error);
            throw error;
        }
    }

    /**
     * Get thumbnails for a file
     */
    async getThumbnails(fileId: string, tenantId: string): Promise<ThumbnailResult[]> {
        try {
            const thumbnails = await this.db.collection('thumbnails').find({
                fileId,
                tenantId,
                isDeleted: false
            }).toArray();

            return thumbnails.map(t => ({
                thumbnailId: t.thumbnailId,
                variant: t.variant,
                width: t.width,
                height: t.height,
                fileSize: t.fileSize,
                storagePath: t.storagePath,
                mimeType: t.mimeType
            }));
        } catch (error) {
            logger.error('Failed to get thumbnails:', error);
            return [];
        }
    }

    /**
     * Get thumbnail by variant
     */
    async getThumbnailByVariant(
        fileId: string,
        tenantId: string,
        variant: string
    ): Promise<ThumbnailResult | null> {
        try {
            const thumbnail = await this.db.collection('thumbnails').findOne({
                fileId,
                tenantId,
                variant,
                isDeleted: false
            });

            if (!thumbnail) {
                return null;
            }

            return {
                thumbnailId: thumbnail.thumbnailId,
                variant: thumbnail.variant,
                width: thumbnail.width,
                height: thumbnail.height,
                fileSize: thumbnail.fileSize,
                storagePath: thumbnail.storagePath,
                mimeType: thumbnail.mimeType
            };
        } catch (error) {
            logger.error('Failed to get thumbnail by variant:', error);
            return null;
        }
    }

    /**
     * Download thumbnail
     */
    async downloadThumbnail(thumbnailId: string, tenantId: string): Promise<Buffer | null> {
        try {
            const thumbnail = await this.db.collection('thumbnails').findOne({
                thumbnailId,
                tenantId,
                isDeleted: false
            });

            if (!thumbnail) {
                return null;
            }

            return await this.storageProvider.downloadFile(thumbnail.storagePath);
        } catch (error) {
            logger.error('Failed to download thumbnail:', error);
            return null;
        }
    }

    /**
     * Delete thumbnails for a file
     */
    async deleteThumbnails(fileId: string, tenantId: string): Promise<boolean> {
        try {
            // Get all thumbnails for the file
            const thumbnails = await this.getThumbnails(fileId, tenantId);

            // Delete from storage
            const deletePromises = thumbnails.map(thumbnail =>
                this.storageProvider.deleteFile(thumbnail.storagePath)
            );
            await Promise.all(deletePromises);

            // Mark as deleted in database
            await this.db.collection('thumbnails').updateMany(
                { fileId, tenantId },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date()
                    }
                }
            );

            logger.info(`Deleted ${thumbnails.length} thumbnails for file ${fileId}`);
            return true;
        } catch (error) {
            logger.error('Failed to delete thumbnails:', error);
            return false;
        }
    }

    /**
     * Add or update thumbnail variant
     */
    addVariant(name: string, config: ThumbnailConfig): void {
        this.variants.set(name, config);
        logger.info(`Added thumbnail variant: ${name}`, config);
    }

    /**
     * Remove thumbnail variant
     */
    removeVariant(name: string): boolean {
        const removed = this.variants.delete(name);
        if (removed) {
            logger.info(`Removed thumbnail variant: ${name}`);
        }
        return removed;
    }

    /**
     * Get available variants
     */
    getVariants(): Array<{ name: string; config: ThumbnailConfig }> {
        return Array.from(this.variants.entries()).map(([name, config]) => ({
            name,
            config
        }));
    }

    /**
     * Clean up orphaned thumbnails
     */
    async cleanupOrphanedThumbnails(): Promise<number> {
        try {
            // Find thumbnails without corresponding media files
            const orphanedThumbnails = await this.db.collection('thumbnails').aggregate([
                {
                    $lookup: {
                        from: 'media_files',
                        localField: 'fileId',
                        foreignField: 'fileId',
                        as: 'mediaFile'
                    }
                },
                {
                    $match: {
                        mediaFile: { $size: 0 },
                        isDeleted: false
                    }
                }
            ]).toArray();

            let deletedCount = 0;

            for (const thumbnail of orphanedThumbnails) {
                try {
                    // Delete from storage
                    await this.storageProvider.deleteFile(thumbnail.storagePath);

                    // Mark as deleted in database
                    await this.db.collection('thumbnails').updateOne(
                        { _id: thumbnail._id },
                        {
                            $set: {
                                isDeleted: true,
                                deletedAt: new Date()
                            }
                        }
                    );

                    deletedCount++;
                } catch (error) {
                    logger.error(`Failed to delete orphaned thumbnail ${thumbnail.thumbnailId}:`, error);
                }
            }

            logger.info(`Cleaned up ${deletedCount} orphaned thumbnails`);
            return deletedCount;
        } catch (error) {
            logger.error('Failed to cleanup orphaned thumbnails:', error);
            return 0;
        }
    }

    /**
     * Private methods
     */

    private initializeDefaultVariants(): void {
        // Small thumbnail for lists
        this.addVariant('small', {
            width: 150,
            height: 150,
            quality: 80,
            format: 'jpeg'
        });

        // Medium thumbnail for previews
        this.addVariant('medium', {
            width: 300,
            height: 300,
            quality: 85,
            format: 'jpeg'
        });

        // Large thumbnail for detailed views
        this.addVariant('large', {
            width: 600,
            height: 600,
            quality: 90,
            format: 'jpeg'
        });

        // WebP variants for modern browsers
        this.addVariant('small_webp', {
            width: 150,
            height: 150,
            quality: 80,
            format: 'webp'
        });

        this.addVariant('medium_webp', {
            width: 300,
            height: 300,
            quality: 85,
            format: 'webp'
        });
    }

    private async generateThumbnail(
        fileId: string,
        originalBuffer: Buffer,
        tenantId: string,
        variantName: string,
        config: ThumbnailConfig
    ): Promise<ThumbnailResult> {
        const thumbnailId = `${fileId}_${variantName}_${Date.now()}`;
        const storagePath = `thumbnails/${tenantId}/${fileId}/${thumbnailId}.${config.format}`;

        // Generate thumbnail
        let thumbnailBuffer: Buffer;
        let actualWidth: number;
        let actualHeight: number;

        const image = sharp(originalBuffer);

        if (config.format === 'webp') {
            const processed = await image
                .resize(config.width, config.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: config.quality })
                .toBuffer({ resolveWithObject: true });

            thumbnailBuffer = processed.data;
            actualWidth = processed.info.width;
            actualHeight = processed.info.height;
        } else if (config.format === 'png') {
            const processed = await image
                .resize(config.width, config.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png({ quality: config.quality })
                .toBuffer({ resolveWithObject: true });

            thumbnailBuffer = processed.data;
            actualWidth = processed.info.width;
            actualHeight = processed.info.height;
        } else {
            // Default to JPEG
            const processed = await image
                .resize(config.width, config.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: config.quality })
                .toBuffer({ resolveWithObject: true });

            thumbnailBuffer = processed.data;
            actualWidth = processed.info.width;
            actualHeight = processed.info.height;
        }

        // Upload to storage
        const mimeType = `image/${config.format}`;
        await this.storageProvider.uploadFile(
            storagePath,
            thumbnailBuffer,
            mimeType,
            {
                fileId,
                variant: variantName,
                originalWidth: config.width.toString(),
                originalHeight: config.height.toString()
            }
        );

        return {
            thumbnailId,
            variant: variantName,
            width: actualWidth,
            height: actualHeight,
            fileSize: thumbnailBuffer.length,
            storagePath,
            mimeType
        };
    }

    private async saveThumbnailRecords(
        fileId: string,
        tenantId: string,
        thumbnails: ThumbnailResult[]
    ): Promise<void> {
        const records = thumbnails.map(thumbnail => ({
            thumbnailId: thumbnail.thumbnailId,
            fileId,
            tenantId,
            variant: thumbnail.variant,
            width: thumbnail.width,
            height: thumbnail.height,
            fileSize: thumbnail.fileSize,
            storagePath: thumbnail.storagePath,
            mimeType: thumbnail.mimeType,
            createdAt: new Date(),
            isDeleted: false
        }));

        await this.db.collection('thumbnails').insertMany(records);
    }
}