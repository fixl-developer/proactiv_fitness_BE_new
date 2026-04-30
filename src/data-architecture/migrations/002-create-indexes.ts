import { Db } from 'mongodb';
import { Migration } from './migration.interface';
import { COLLECTIONS } from '../constants';

export const migration002: Migration = {
    version: 2,
    name: 'Create all indexes for performance',

    async up(db: Db): Promise<void> {
        // Users collection indexes
        await db.collection(COLLECTIONS.USERS).createIndexes([
            { key: { email: 1, countryId: 1 }, unique: true },
            { key: { countryId: 1, regionId: 1, businessUnitId: 1, locationId: 1 } },
            { key: { role: 1, status: 1 } },
            { key: { createdAt: -1 } },
        ]);

        // Countries collection indexes
        await db.collection(COLLECTIONS.COUNTRIES).createIndexes([
            { key: { code: 1 }, unique: true },
            { key: { isActive: 1 } },
        ]);

        // Regions collection indexes
        await db.collection(COLLECTIONS.REGIONS).createIndexes([
            { key: { countryId: 1, code: 1 }, unique: true },
            { key: { countryId: 1, isActive: 1 } },
        ]);

        // Business Units collection indexes
        await db.collection(COLLECTIONS.BUSINESS_UNITS).createIndexes([
            { key: { countryId: 1, regionId: 1, code: 1 }, unique: true },
            { key: { countryId: 1, regionId: 1, type: 1 } },
            { key: { type: 1, isActive: 1 } },
        ]);

        // Locations collection indexes
        await db.collection(COLLECTIONS.LOCATIONS).createIndexes([
            { key: { businessUnitId: 1, code: 1 }, unique: true },
            { key: { countryId: 1, regionId: 1, businessUnitId: 1 } },
            { key: { isActive: 1 } },
        ]);

        // Audit Logs collection indexes (append-only)
        await db.collection(COLLECTIONS.AUDIT_LOGS).createIndexes([
            { key: { countryId: 1, timestamp: -1 } },
            { key: { userId: 1, timestamp: -1 } },
            { key: { entityType: 1, entityId: 1, timestamp: -1 } },
            { key: { eventType: 1, timestamp: -1 } },
            { key: { timestamp: -1 } }, // For time-range queries
        ]);

        // Ledger Entries collection indexes (append-only)
        await db.collection(COLLECTIONS.LEDGER_ENTRIES).createIndexes([
            { key: { transactionId: 1 }, unique: true },
            { key: { locationId: 1, timestamp: -1 } },
            { key: { accountId: 1, timestamp: -1 } },
            { key: { businessUnitId: 1, timestamp: -1 } },
            { key: { timestamp: -1 } },
        ]);

        // Location Daily Stats collection indexes (projection)
        await db.collection(COLLECTIONS.LOCATION_DAILY_STATS).createIndexes([
            { key: { locationId: 1, date: 1 }, unique: true },
            { key: { locationId: 1, date: -1 } },
            { key: { date: 1, locationId: 1 } },
        ]);

        // User Activity Summary collection indexes (projection)
        await db.collection(COLLECTIONS.USER_ACTIVITY_SUMMARY).createIndexes([
            { key: { userId: 1, month: 1 }, unique: true },
            { key: { userId: 1, month: -1 } },
            { key: { month: 1, userId: 1 } },
        ]);

        console.log('✅ Migration 002: Indexes created successfully');
    },

    async down(db: Db): Promise<void> {
        // Drop all indexes except _id (MongoDB doesn't allow dropping _id index)
        const collections = [
            COLLECTIONS.USERS,
            COLLECTIONS.COUNTRIES,
            COLLECTIONS.REGIONS,
            COLLECTIONS.BUSINESS_UNITS,
            COLLECTIONS.LOCATIONS,
            COLLECTIONS.AUDIT_LOGS,
            COLLECTIONS.LEDGER_ENTRIES,
            COLLECTIONS.LOCATION_DAILY_STATS,
            COLLECTIONS.USER_ACTIVITY_SUMMARY,
        ];

        for (const collectionName of collections) {
            const collection = db.collection(collectionName);
            const indexes = await collection.listIndexes().toArray();

            for (const index of indexes) {
                if (index.name !== '_id_') {
                    await collection.dropIndex(index.name);
                }
            }
        }

        console.log('✅ Migration 002: Indexes dropped successfully');
    },
};


// Export alias for backward compatibility
export const createIndexesMigration = migration002;
