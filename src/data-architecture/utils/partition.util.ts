import { Db } from 'mongodb';
import logger from '../../shared/utils/logger.util';

export interface PartitionConfig {
    type: 'date' | 'tenant';
    dateFormat?: 'YYYY_MM' | 'YYYY_MM_DD';
    tenantField?: string;
}

/**
 * Partition Utility for managing time-series and tenant-based partitions
 */
export class PartitionUtil {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Generate partition name based on configuration
     */
    generatePartitionName(
        baseCollectionName: string,
        config: PartitionConfig,
        date?: Date,
        tenantId?: string
    ): string {
        if (config.type === 'date' && date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            if (config.dateFormat === 'YYYY_MM_DD') {
                return `${baseCollectionName}_${year}_${month}_${day}`;
            } else {
                return `${baseCollectionName}_${year}_${month}`;
            }
        }

        if (config.type === 'tenant' && tenantId) {
            return `${baseCollectionName}_${tenantId}`;
        }

        return baseCollectionName;
    }

    /**
     * Create partition if it doesn't exist
     */
    async ensurePartition(
        partitionName: string,
        indexes?: any[]
    ): Promise<void> {
        try {
            const collections = await this.db.listCollections({ name: partitionName }).toArray();

            if (collections.length === 0) {
                await this.db.createCollection(partitionName);
                logger.info(`Created partition: ${partitionName}`);

                // Create indexes if provided
                if (indexes && indexes.length > 0) {
                    const collection = this.db.collection(partitionName);
                    for (const index of indexes) {
                        await collection.createIndex(index.keys, index.options || {});
                    }
                    logger.info(`Created ${indexes.length} indexes for partition: ${partitionName}`);
                }
            }
        } catch (error) {
            logger.error(`Failed to ensure partition: ${partitionName}`, error);
            throw error;
        }
    }

    /**
     * List all partitions for a base collection
     */
    async listPartitions(baseCollectionName: string): Promise<string[]> {
        const collections = await this.db.listCollections().toArray();
        return collections
            .map(col => col.name)
            .filter(name => name.startsWith(`${baseCollectionName}_`))
            .sort();
    }

    /**
     * Archive old partitions
     */
    async archivePartition(
        partitionName: string,
        archiveCollectionName: string
    ): Promise<void> {
        try {
            const sourceCollection = this.db.collection(partitionName);
            const archiveCollection = this.db.collection(archiveCollectionName);

            // Copy all documents to archive
            const documents = await sourceCollection.find({}).toArray();
            if (documents.length > 0) {
                await archiveCollection.insertMany(documents);
                logger.info(`Archived ${documents.length} documents from ${partitionName} to ${archiveCollectionName}`);
            }

            // Drop the original partition
            await sourceCollection.drop();
            logger.info(`Dropped partition: ${partitionName}`);
        } catch (error) {
            logger.error(`Failed to archive partition: ${partitionName}`, error);
            throw error;
        }
    }

    /**
     * Get partition statistics
     */
    async getPartitionStats(partitionName: string): Promise<{
        documentCount: number;
        storageSize: number;
        indexSize: number;
    }> {
        try {
            const collection = this.db.collection(partitionName);
            const stats = await this.db.command({ collStats: partitionName });

            return {
                documentCount: stats.count || 0,
                storageSize: stats.storageSize || 0,
                indexSize: stats.totalIndexSize || 0,
            };
        } catch (error) {
            logger.error(`Failed to get partition stats: ${partitionName}`, error);
            return {
                documentCount: 0,
                storageSize: 0,
                indexSize: 0,
            };
        }
    }

    /**
     * Query across multiple partitions
     */
    async queryAcrossPartitions<T>(
        partitionNames: string[],
        filter: any,
        options: any = {}
    ): Promise<T[]> {
        const results: T[] = [];

        for (const partitionName of partitionNames) {
            try {
                const collection = this.db.collection<T>(partitionName);
                const partitionResults = await collection.find(filter, options).toArray();
                results.push(...partitionResults);
            } catch (error) {
                logger.warn(`Failed to query partition: ${partitionName}`, error);
                // Continue with other partitions
            }
        }

        // Sort results if sort option is provided
        if (options.sort) {
            const sortKey = Object.keys(options.sort)[0];
            const sortOrder = options.sort[sortKey];
            results.sort((a: any, b: any) => {
                if (sortOrder === 1) {
                    return a[sortKey] > b[sortKey] ? 1 : -1;
                } else {
                    return a[sortKey] < b[sortKey] ? 1 : -1;
                }
            });
        }

        return results;
    }
}