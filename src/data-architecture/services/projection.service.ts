import { Db, Collection } from 'mongodb';
import logger from '../../shared/utils/logger.util';

/**
 * Projection Service - Handles materialized views and projections
 * Used for denormalizing data for read-heavy operations
 */
export class ProjectionService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Create a projection (materialized view)
     */
    async createProjection<T>(
        name: string,
        sourceCollection: string,
        pipeline: any[]
    ): Promise<void> {
        try {
            const collection = this.db.collection(name);

            // Drop existing projection if it exists
            try {
                await collection.drop();
            } catch (error) {
                // Collection doesn't exist, that's fine
            }

            // Run aggregation pipeline and store results
            const results = await this.db
                .collection(sourceCollection)
                .aggregate(pipeline)
                .toArray();

            if (results.length > 0) {
                await collection.insertMany(results);
            }

            logger.info(`Projection '${name}' created successfully with ${results.length} documents`);
        } catch (error) {
            logger.error(`Failed to create projection '${name}':`, error);
            throw error;
        }
    }

    /**
     * Update a projection
     */
    async updateProjection<T>(
        name: string,
        sourceCollection: string,
        pipeline: any[]
    ): Promise<void> {
        try {
            const collection = this.db.collection(name);

            // Clear existing projection
            await collection.deleteMany({});

            // Run aggregation pipeline and store results
            const results = await this.db
                .collection(sourceCollection)
                .aggregate(pipeline)
                .toArray();

            if (results.length > 0) {
                await collection.insertMany(results);
            }

            logger.info(`Projection '${name}' updated successfully with ${results.length} documents`);
        } catch (error) {
            logger.error(`Failed to update projection '${name}':`, error);
            throw error;
        }
    }

    /**
     * Query a projection
     */
    async queryProjection<T>(
        name: string,
        filter: any = {},
        options: any = {}
    ): Promise<T[]> {
        try {
            const collection = this.db.collection(name);
            const results = await collection
                .find(filter)
                .sort(options.sort || { _id: -1 })
                .limit(options.limit || 100)
                .toArray();

            return results as T[];
        } catch (error) {
            logger.error(`Failed to query projection '${name}':`, error);
            throw error;
        }
    }

    /**
     * Delete a projection
     */
    async deleteProjection(name: string): Promise<void> {
        try {
            const collection = this.db.collection(name);
            await collection.drop();
            logger.info(`Projection '${name}' deleted successfully`);
        } catch (error) {
            logger.error(`Failed to delete projection '${name}':`, error);
            throw error;
        }
    }
}
