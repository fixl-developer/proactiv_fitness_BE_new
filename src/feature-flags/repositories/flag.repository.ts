/**
 * Feature Flags Repository
 * 
 * Handles database operations for feature flags with MongoDB integration.
 * Provides CRUD operations, querying, and optimistic locking.
 */

import { Collection, MongoClient, ObjectId } from 'mongodb';
import { FlagDefinition, FlagQueryFilters, HierarchyLevel, Environment } from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import { Logger } from '../../shared/utils/logger.util';

export class FlagRepository {
    private collection: Collection<FlagDefinition>;
    private logger = Logger.getInstance();

    constructor(private dbClient: MongoClient) {
        const dbName = process.env.MONGODB_DATABASE_NAME || 'proactiv_fitness_db';
        const db = this.dbClient.db(dbName);
        this.collection = db.collection('feature_flags');
    }

    /**
     * Create a new feature flag
     */
    async create(flag: Omit<FlagDefinition, '_id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<FlagDefinition> {
        try {
            const now = new Date();
            const flagWithMetadata: FlagDefinition = {
                ...flag,
                createdAt: now,
                updatedAt: now,
                version: 1
            };

            const result = await this.collection.insertOne(flagWithMetadata as any);

            if (!result.insertedId) {
                throw new AppError('Failed to create feature flag', 500);
            }

            const createdFlag = await this.collection.findOne({ _id: result.insertedId });
            if (!createdFlag) {
                throw new AppError('Failed to retrieve created feature flag', 500);
            }

            this.logger.info(`Feature flag created: ${flag.flagKey}`, {
                flagKey: flag.flagKey,
                tenantId: flag.tenantId,
                hierarchyLevel: flag.hierarchyLevel
            });

            return createdFlag;
        } catch (error) {
            this.logger.error('Error creating feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create feature flag', 500);
        }
    }

    /**
     * Find a single feature flag by criteria
     */
    async findOne(criteria: {
        flagKey: string;
        tenantId: string;
        hierarchyLevel: HierarchyLevel;
        environment: Environment;
    }): Promise<FlagDefinition | null> {
        try {
            const flag = await this.collection.findOne(criteria);
            return flag;
        } catch (error) {
            this.logger.error('Error finding feature flag:', error);
            throw new AppError('Failed to find feature flag', 500);
        }
    }

    /**
     * Find multiple feature flags with filters
     */
    async findMany(filters: FlagQueryFilters, limit = 100, offset = 0): Promise<FlagDefinition[]> {
        try {
            const query: any = {};

            if (filters.tenantId) query.tenantId = filters.tenantId;
            if (filters.hierarchyLevel) query.hierarchyLevel = filters.hierarchyLevel;
            if (filters.environment) query.environment = filters.environment;
            if (filters.createdBy) query.createdBy = filters.createdBy;
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            if (filters.updatedAfter || filters.updatedBefore) {
                query.updatedAt = {};
                if (filters.updatedAfter) query.updatedAt.$gte = filters.updatedAfter;
                if (filters.updatedBefore) query.updatedAt.$lte = filters.updatedBefore;
            }

            const flags = await this.collection
                .find(query)
                .sort({ updatedAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray();

            return flags;
        } catch (error) {
            this.logger.error('Error finding feature flags:', error);
            throw new AppError('Failed to find feature flags', 500);
        }
    }

    /**
     * Update a feature flag with optimistic locking
     */
    async update(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment,
        updates: Partial<FlagDefinition>,
        currentVersion: number
    ): Promise<FlagDefinition> {
        try {
            const now = new Date();
            const updateDoc = {
                ...updates,
                updatedAt: now,
                version: currentVersion + 1
            };

            const result = await this.collection.findOneAndUpdate(
                {
                    flagKey,
                    tenantId,
                    hierarchyLevel,
                    environment,
                    version: currentVersion
                },
                { $set: updateDoc },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                throw new AppError('Feature flag not found or version conflict', 409);
            }

            this.logger.info(`Feature flag updated: ${flagKey}`, {
                flagKey,
                tenantId,
                hierarchyLevel,
                version: currentVersion + 1
            });

            return result.value;
        } catch (error) {
            this.logger.error('Error updating feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update feature flag', 500);
        }
    }

    /**
     * Delete a feature flag
     */
    async delete(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment
    ): Promise<boolean> {
        try {
            const result = await this.collection.deleteOne({
                flagKey,
                tenantId,
                hierarchyLevel,
                environment
            });

            if (result.deletedCount === 0) {
                throw new AppError('Feature flag not found', 404);
            }

            this.logger.info(`Feature flag deleted: ${flagKey}`, {
                flagKey,
                tenantId,
                hierarchyLevel
            });

            return true;
        } catch (error) {
            this.logger.error('Error deleting feature flag:', error);
            throw error instanceof AppError ? error : new AppError('Failed to delete feature flag', 500);
        }
    }

    /**
     * Get all flags for a specific flag key across hierarchy levels
     */
    async findByFlagKey(flagKey: string, environment: Environment): Promise<FlagDefinition[]> {
        try {
            const flags = await this.collection
                .find({ flagKey, environment })
                .sort({ hierarchyLevel: 1 }) // HQ first, then REGION, FRANCHISE, LOCATION
                .toArray();

            return flags;
        } catch (error) {
            this.logger.error('Error finding flags by key:', error);
            throw new AppError('Failed to find flags by key', 500);
        }
    }

    /**
     * Check if a flag exists
     */
    async exists(
        flagKey: string,
        tenantId: string,
        hierarchyLevel: HierarchyLevel,
        environment: Environment
    ): Promise<boolean> {
        try {
            const count = await this.collection.countDocuments({
                flagKey,
                tenantId,
                hierarchyLevel,
                environment
            });

            return count > 0;
        } catch (error) {
            this.logger.error('Error checking flag existence:', error);
            throw new AppError('Failed to check flag existence', 500);
        }
    }

    /**
     * Get flags by tenant hierarchy path
     */
    async findByHierarchyPath(
        flagKey: string,
        tenantIds: string[],
        hierarchyLevels: HierarchyLevel[],
        environment: Environment
    ): Promise<FlagDefinition[]> {
        try {
            const conditions = tenantIds.map((tenantId, index) => ({
                flagKey,
                tenantId,
                hierarchyLevel: hierarchyLevels[index],
                environment
            }));

            const flags = await this.collection
                .find({ $or: conditions })
                .toArray();

            return flags;
        } catch (error) {
            this.logger.error('Error finding flags by hierarchy path:', error);
            throw new AppError('Failed to find flags by hierarchy path', 500);
        }
    }

    /**
     * Create indexes for optimal query performance
     */
    async createIndexes(): Promise<void> {
        try {
            await this.collection.createIndexes([
                {
                    key: { flagKey: 1, tenantId: 1, hierarchyLevel: 1, environment: 1 },
                    unique: true,
                    name: 'flag_unique_constraint'
                },
                {
                    key: { tenantId: 1, hierarchyLevel: 1 },
                    name: 'tenant_hierarchy_index'
                },
                {
                    key: { flagKey: 1, environment: 1 },
                    name: 'flag_environment_index'
                },
                {
                    key: { tags: 1 },
                    name: 'tags_index'
                },
                {
                    key: { updatedAt: -1 },
                    name: 'updated_at_index'
                },
                {
                    key: { createdBy: 1 },
                    name: 'created_by_index'
                }
            ]);

            this.logger.info('Feature flags indexes created successfully');
        } catch (error) {
            this.logger.error('Error creating feature flags indexes:', error);
            throw new AppError('Failed to create feature flags indexes', 500);
        }
    }
}