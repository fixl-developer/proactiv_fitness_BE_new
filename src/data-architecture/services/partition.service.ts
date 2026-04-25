import { Db, Collection } from 'mongodb';
import logger from '../../shared/utils/logger.util';

/**
 * Partition Service - Handles data partitioning strategies
 * Used for distributing data across multiple collections or databases
 */
export class PartitionService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Get partition key for a document
     */
    getPartitionKey(document: any, partitionField: string): string {
        const value = document[partitionField];
        if (!value) {
            throw new Error(`Partition field '${partitionField}' not found in document`);
        }
        return String(value);
    }

    /**
     * Get partition collection name
     */
    getPartitionCollectionName(baseCollection: string, partitionKey: string): string {
        return `${baseCollection}_${partitionKey}`;
    }

    /**
     * Insert document into appropriate partition
     */
    async insertIntoPartition<T>(
        baseCollection: string,
        document: T,
        partitionField: string
    ): Promise<any> {
        try {
            const partitionKey = this.getPartitionKey(document as any, partitionField);
            const collectionName = this.getPartitionCollectionName(baseCollection, partitionKey);
            const collection = this.db.collection(collectionName);

            const result = await collection.insertOne(document as any);
            logger.debug(`Document inserted into partition '${collectionName}'`);
            return result;
        } catch (error) {
            logger.error(`Failed to insert into partition:`, error);
            throw error;
        }
    }

    /**
     * Query across all partitions
     */
    async queryAllPartitions<T>(
        baseCollection: string,
        filter: any = {}
    ): Promise<T[]> {
        try {
            const collections = await this.db.listCollections({ name: new RegExp(`^${baseCollection}_`) }).toArray();
            const results: T[] = [];

            for (const collectionInfo of collections) {
                const collection = this.db.collection(collectionInfo.name);
                const docs = await collection.find(filter).toArray();
                results.push(...(docs as T[]));
            }

            return results;
        } catch (error) {
            logger.error(`Failed to query all partitions:`, error);
            throw error;
        }
    }

    /**
     * Query specific partition
     */
    async queryPartition<T>(
        baseCollection: string,
        partitionKey: string,
        filter: any = {}
    ): Promise<T[]> {
        const collectionName = this.getPartitionCollectionName(baseCollection, partitionKey);
        try {
            const collection = this.db.collection(collectionName);
            const results = await collection.find(filter).toArray();
            return results as T[];
        } catch (error) {
            logger.error(`Failed to query partition '${collectionName}':`, error);
            throw error;
        }
    }

    /**
     * Get partition statistics
     */
    async getPartitionStats(baseCollection: string): Promise<any> {
        try {
            const collections = await this.db.listCollections({ name: new RegExp(`^${baseCollection}_`) }).toArray();
            const stats: any = {};

            for (const collectionInfo of collections) {
                const collection = this.db.collection(collectionInfo.name);
                const count = await collection.countDocuments();
                stats[collectionInfo.name] = { documentCount: count };
            }

            return stats;
        } catch (error) {
            logger.error(`Failed to get partition stats:`, error);
            throw error;
        }
    }
}
