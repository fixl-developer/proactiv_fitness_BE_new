import { Db, Collection } from 'mongodb';
import logger from '../../shared/utils/logger.util';

/**
 * Integrity Service - Handles data integrity checks and validation
 * Used for ensuring data consistency and referential integrity
 */
export class IntegrityService {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    /**
     * Check referential integrity
     */
    async checkReferentialIntegrity(
        collection: string,
        foreignKeyField: string,
        referencedCollection: string,
        referencedField: string = '_id'
    ): Promise<{
        isValid: boolean;
        orphanedDocuments: number;
        orphanedIds: any[];
    }> {
        try {
            const sourceCollection = this.db.collection(collection);
            const refCollection = this.db.collection(referencedCollection);

            // Get all foreign key values
            const foreignKeys = await sourceCollection
                .find({})
                .project({ [foreignKeyField]: 1 })
                .toArray();

            const foreignKeyValues = foreignKeys
                .map((doc: any) => doc[foreignKeyField])
                .filter((val: any) => val !== null && val !== undefined);

            // Check which ones don't exist in referenced collection
            const orphaned = await refCollection
                .find({
                    [referencedField]: { $nin: foreignKeyValues }
                })
                .toArray();

            const isValid = orphaned.length === 0;

            logger.info(`Referential integrity check for ${collection}.${foreignKeyField} -> ${referencedCollection}.${referencedField}: ${isValid ? 'VALID' : 'INVALID'}`);

            return {
                isValid,
                orphanedDocuments: orphaned.length,
                orphanedIds: orphaned.map((doc: any) => doc[referencedField])
            };
        } catch (error) {
            logger.error(`Failed to check referential integrity:`, error);
            throw error;
        }
    }

    /**
     * Validate schema compliance
     */
    async validateSchemaCompliance(
        collection: string,
        requiredFields: string[]
    ): Promise<{
        isValid: boolean;
        invalidDocuments: number;
        missingFields: { [key: string]: number };
    }> {
        try {
            const col = this.db.collection(collection);
            const documents = await col.find({}).toArray();

            const missingFields: { [key: string]: number } = {};
            let invalidCount = 0;

            for (const field of requiredFields) {
                missingFields[field] = 0;
            }

            for (const doc of documents) {
                for (const field of requiredFields) {
                    if (doc[field] === null || doc[field] === undefined) {
                        missingFields[field]++;
                        invalidCount++;
                    }
                }
            }

            const isValid = invalidCount === 0;

            logger.info(`Schema compliance check for ${collection}: ${isValid ? 'VALID' : 'INVALID'}`);

            return {
                isValid,
                invalidDocuments: invalidCount,
                missingFields
            };
        } catch (error) {
            logger.error(`Failed to validate schema compliance:`, error);
            throw error;
        }
    }

    /**
     * Check for duplicate entries
     */
    async checkForDuplicates(
        collection: string,
        uniqueFields: string[]
    ): Promise<{
        hasDuplicates: boolean;
        duplicateCount: number;
        duplicates: any[];
    }> {
        try {
            const col = this.db.collection(collection);

            const pipeline = [
                {
                    $group: {
                        _id: uniqueFields.reduce((acc: any, field: string) => {
                            acc[field] = `$${field}`;
                            return acc;
                        }, {}),
                        count: { $sum: 1 },
                        ids: { $push: '$_id' }
                    }
                },
                {
                    $match: { count: { $gt: 1 } }
                }
            ];

            const duplicates = await col.aggregate(pipeline).toArray();
            const hasDuplicates = duplicates.length > 0;

            logger.info(`Duplicate check for ${collection}: ${hasDuplicates ? 'FOUND' : 'NONE'}`);

            return {
                hasDuplicates,
                duplicateCount: duplicates.length,
                duplicates
            };
        } catch (error) {
            logger.error(`Failed to check for duplicates:`, error);
            throw error;
        }
    }

    /**
     * Run comprehensive integrity check
     */
    async runComprehensiveCheck(
        collection: string,
        config: {
            requiredFields?: string[];
            uniqueFields?: string[];
            foreignKeys?: Array<{
                field: string;
                referencedCollection: string;
                referencedField?: string;
            }>;
        }
    ): Promise<{
        collection: string;
        timestamp: Date;
        schemaCompliance: any;
        duplicates: any;
        referentialIntegrity: any[];
        isHealthy: boolean;
    }> {
        try {
            const results: any = {
                collection,
                timestamp: new Date(),
                schemaCompliance: null,
                duplicates: null,
                referentialIntegrity: [],
                isHealthy: true
            };

            // Check schema compliance
            if (config.requiredFields && config.requiredFields.length > 0) {
                results.schemaCompliance = await this.validateSchemaCompliance(
                    collection,
                    config.requiredFields
                );
                if (!results.schemaCompliance.isValid) {
                    results.isHealthy = false;
                }
            }

            // Check for duplicates
            if (config.uniqueFields && config.uniqueFields.length > 0) {
                results.duplicates = await this.checkForDuplicates(
                    collection,
                    config.uniqueFields
                );
                if (results.duplicates.hasDuplicates) {
                    results.isHealthy = false;
                }
            }

            // Check referential integrity
            if (config.foreignKeys && config.foreignKeys.length > 0) {
                for (const fk of config.foreignKeys) {
                    const integrity = await this.checkReferentialIntegrity(
                        collection,
                        fk.field,
                        fk.referencedCollection,
                        fk.referencedField || '_id'
                    );
                    results.referentialIntegrity.push(integrity);
                    if (!integrity.isValid) {
                        results.isHealthy = false;
                    }
                }
            }

            logger.info(`Comprehensive integrity check for ${collection}: ${results.isHealthy ? 'HEALTHY' : 'ISSUES FOUND'}`);

            return results;
        } catch (error) {
            logger.error(`Failed to run comprehensive check:`, error);
            throw error;
        }
    }
}
