import { Collection, Db, InsertOneResult, InsertManyResult } from 'mongodb';
import { AuditLog, LedgerEntry } from '../interfaces';
import logger from '../../shared/utils/logger.util';

/**
 * Append-Only Collection Service
 * Provides a wrapper for collections that should only allow inserts
 */
export class AppendOnlyService<T extends Document> {
    private collection: Collection<T>;
    private collectionName: string;

    constructor(db: Db, collectionName: string) {
        this.collection = db.collection<T>(collectionName);
        this.collectionName = collectionName;
    }

    /**
     * Insert a single document
     */
    async insertOne(document: Omit<T, '_id'>): Promise<InsertOneResult<T>> {
        try {
            // Add timestamp if not present
            const docWithTimestamp = {
                ...document,
                timestamp: new Date(),
            } as T;

            const result = await this.collection.insertOne(docWithTimestamp);

            logger.info(`Document inserted into ${this.collectionName}`, {
                insertedId: result.insertedId,
                collection: this.collectionName,
            });

            return result;
        } catch (error) {
            logger.error(`Failed to insert document into ${this.collectionName}`, {
                error,
                document,
            });
            throw error;
        }
    }

    /**
     * Insert multiple documents
     */
    async insertMany(documents: Omit<T, '_id'>[]): Promise<InsertManyResult<T>> {
        try {
            // Add timestamps if not present
            const docsWithTimestamps = documents.map(doc => ({
                ...doc,
                timestamp: new Date(),
            })) as T[];

            const result = await this.collection.insertMany(docsWithTimestamps);

            logger.info(`${documents.length} documents inserted into ${this.collectionName}`, {
                insertedCount: result.insertedCount,
                collection: this.collectionName,
            });

            return result;
        } catch (error) {
            logger.error(`Failed to insert documents into ${this.collectionName}`, {
                error,
                documentCount: documents.length,
            });
            throw error;
        }
    }

    /**
     * Find documents (read-only operations are allowed)
     */
    find(filter: any = {}) {
        return this.collection.find(filter);
    }

    /**
     * Find one document
     */
    async findOne(filter: any) {
        return this.collection.findOne(filter);
    }

    /**
     * Count documents
     */
    async countDocuments(filter: any = {}) {
        return this.collection.countDocuments(filter);
    }

    /**
     * Create aggregation pipeline
     */
    aggregate(pipeline: any[]) {
        return this.collection.aggregate(pipeline);
    }

    /**
     * Blocked operations - these will throw errors
     */

    updateOne(): never {
        throw new Error(`Update operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    updateMany(): never {
        throw new Error(`Update operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    replaceOne(): never {
        throw new Error(`Replace operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    deleteOne(): never {
        throw new Error(`Delete operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    deleteMany(): never {
        throw new Error(`Delete operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    findOneAndUpdate(): never {
        throw new Error(`Update operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    findOneAndReplace(): never {
        throw new Error(`Replace operations are not allowed on append-only collection: ${this.collectionName}`);
    }

    findOneAndDelete(): never {
        throw new Error(`Delete operations are not allowed on append-only collection: ${this.collectionName}`);
    }
}

/**
 * Audit Log Service - specialized append-only service for audit logs
 */
export class AuditLogService extends AppendOnlyService<AuditLog> {
    constructor(db: Db) {
        super(db, 'audit_logs');
    }

    /**
     * Log an audit event
     */
    async logEvent(event: Omit<AuditLog, '_id' | 'timestamp'>): Promise<void> {
        await this.insertOne({
            ...event,
            timestamp: new Date(),
        } as Omit<AuditLog, '_id'>);
    }

    /**
     * Get audit trail for an entity
     */
    async getEntityAuditTrail(entityType: string, entityId: string) {
        return this.find({ entityType, entityId }).sort({ timestamp: -1 }).toArray();
    }

    /**
     * Get user activity logs
     */
    async getUserActivity(userId: string, startDate?: Date, endDate?: Date) {
        const filter: any = { userId };

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = startDate;
            if (endDate) filter.timestamp.$lte = endDate;
        }

        return this.find(filter).sort({ timestamp: -1 }).toArray();
    }
}

/**
 * Ledger Service - specialized append-only service for financial ledger
 */
export class LedgerService extends AppendOnlyService<LedgerEntry> {
    constructor(db: Db) {
        super(db, 'ledger_entries');
    }

    /**
     * Record a ledger entry
     */
    async recordEntry(entry: Omit<LedgerEntry, '_id' | 'timestamp'>): Promise<void> {
        await this.insertOne({
            ...entry,
            timestamp: new Date(),
        } as Omit<LedgerEntry, '_id'>);
    }

    /**
     * Get account balance
     */
    async getAccountBalance(accountId: string): Promise<number> {
        const pipeline = [
            { $match: { accountId } },
            {
                $group: {
                    _id: null,
                    balance: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'credit'] },
                                '$amount',
                                { $multiply: ['$amount', -1] },
                            ],
                        },
                    },
                },
            },
        ];

        const result = await this.aggregate(pipeline).toArray();
        return result.length > 0 ? result[0].balance : 0;
    }

    /**
     * Get transaction history for an account
     */
    async getTransactionHistory(accountId: string, startDate?: Date, endDate?: Date) {
        const filter: any = { accountId };

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = startDate;
            if (endDate) filter.timestamp.$lte = endDate;
        }

        return this.find(filter).sort({ timestamp: -1 }).toArray();
    }
}