import { Db } from 'mongodb';
import { Migration } from './migration.interface';
import { COLLECTIONS } from '../constants';

export const migration003: Migration = {
    version: 3,
    name: 'Set up append-only collection constraints',

    async up(db: Db): Promise<void> {
        // Note: MongoDB doesn't have built-in append-only constraints
        // These are enforced at the application level through schema pre-hooks
        // This migration sets up any additional constraints we can enforce at DB level

        // Create TTL indexes for temporary data (if any)
        // Example: Session tokens that should expire
        // await db.collection('session_tokens').createIndex(
        //   { createdAt: 1 },
        //   { expireAfterSeconds: 3600 } // 1 hour
        // );

        // Set up any additional validation rules
        await db.command({
            collMod: COLLECTIONS.AUDIT_LOGS,
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['eventType', 'entityType', 'entityId', 'userId', 'timestamp', 'countryId'],
                    properties: {
                        eventType: { bsonType: 'string', minLength: 1 },
                        entityType: { bsonType: 'string', minLength: 1 },
                        entityId: { bsonType: 'objectId' },
                        userId: { bsonType: 'objectId' },
                        changes: { bsonType: 'object' },
                        timestamp: { bsonType: 'date' },
                        ipAddress: { bsonType: 'string' },
                        userAgent: { bsonType: 'string' },
                        countryId: { bsonType: 'objectId' },
                        regionId: { bsonType: 'objectId' },
                        businessUnitId: { bsonType: 'objectId' },
                        locationId: { bsonType: 'objectId' },
                    },
                    additionalProperties: true,
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });

        await db.command({
            collMod: COLLECTIONS.LEDGER_ENTRIES,
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['transactionId', 'accountId', 'amount', 'currency', 'type', 'timestamp', 'description', 'locationId', 'businessUnitId'],
                    properties: {
                        transactionId: { bsonType: 'string', minLength: 1 },
                        accountId: { bsonType: 'objectId' },
                        amount: { bsonType: 'number' },
                        currency: { bsonType: 'string', minLength: 3, maxLength: 3 },
                        type: { enum: ['debit', 'credit'] },
                        timestamp: { bsonType: 'date' },
                        description: { bsonType: 'string', minLength: 1 },
                        metadata: { bsonType: 'object' },
                        locationId: { bsonType: 'objectId' },
                        businessUnitId: { bsonType: 'objectId' },
                    },
                    additionalProperties: true,
                },
            },
            validationLevel: 'strict',
            validationAction: 'error',
        });

        console.log('✅ Migration 003: Append-only constraints set up successfully');
    },

    async down(db: Db): Promise<void> {
        // Remove validation constraints
        await db.command({
            collMod: COLLECTIONS.AUDIT_LOGS,
            validator: {},
            validationLevel: 'off',
        });

        await db.command({
            collMod: COLLECTIONS.LEDGER_ENTRIES,
            validator: {},
            validationLevel: 'off',
        });

        console.log('✅ Migration 003: Constraints removed successfully');
    },
};


// Export alias for backward compatibility
export const setupConstraintsMigration = migration003;
