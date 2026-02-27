import { Db } from 'mongodb';
import { Migration } from './migration.interface';
import { COLLECTIONS } from '../constants';

export const migration001: Migration = {
    version: 1,
    name: 'Create core collections with schemas',

    async up(db: Db): Promise<void> {
        // Create collections with validation schemas

        // Users collection
        await db.createCollection(COLLECTIONS.USERS, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['email', 'firstName', 'lastName', 'role', 'status', 'countryId'],
                    properties: {
                        email: { bsonType: 'string' },
                        firstName: { bsonType: 'string' },
                        lastName: { bsonType: 'string' },
                        role: { bsonType: 'string' },
                        status: { enum: ['active', 'inactive', 'suspended', 'pending'] },
                        countryId: { bsonType: 'objectId' },
                        regionId: { bsonType: 'objectId' },
                        businessUnitId: { bsonType: 'objectId' },
                        locationId: { bsonType: 'objectId' },
                        permissions: { bsonType: 'array' },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                    },
                },
            },
        });

        // Countries collection
        await db.createCollection(COLLECTIONS.COUNTRIES, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'code', 'currency', 'timezone'],
                    properties: {
                        name: { bsonType: 'string' },
                        code: { bsonType: 'string', minLength: 2, maxLength: 3 },
                        currency: { bsonType: 'string', minLength: 3, maxLength: 3 },
                        timezone: { bsonType: 'string' },
                        isActive: { bsonType: 'bool' },
                    },
                },
            },
        });

        // Regions collection
        await db.createCollection(COLLECTIONS.REGIONS, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['countryId', 'name', 'code'],
                    properties: {
                        countryId: { bsonType: 'objectId' },
                        name: { bsonType: 'string' },
                        code: { bsonType: 'string' },
                        isActive: { bsonType: 'bool' },
                    },
                },
            },
        });

        // Business Units collection
        await db.createCollection(COLLECTIONS.BUSINESS_UNITS, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['countryId', 'regionId', 'name', 'code', 'type'],
                    properties: {
                        countryId: { bsonType: 'objectId' },
                        regionId: { bsonType: 'objectId' },
                        name: { bsonType: 'string' },
                        code: { bsonType: 'string' },
                        type: { enum: ['headquarters', 'franchise', 'partner', 'elite_academy'] },
                        isActive: { bsonType: 'bool' },
                    },
                },
            },
        });

        // Locations collection
        await db.createCollection(COLLECTIONS.LOCATIONS, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['countryId', 'regionId', 'businessUnitId', 'name', 'code'],
                    properties: {
                        countryId: { bsonType: 'objectId' },
                        regionId: { bsonType: 'objectId' },
                        businessUnitId: { bsonType: 'objectId' },
                        name: { bsonType: 'string' },
                        code: { bsonType: 'string' },
                        address: { bsonType: 'string' },
                        capacity: { bsonType: 'int', minimum: 1 },
                        isActive: { bsonType: 'bool' },
                    },
                },
            },
        });

        // Audit Logs collection (append-only)
        await db.createCollection(COLLECTIONS.AUDIT_LOGS, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['eventType', 'entityType', 'entityId', 'userId', 'timestamp', 'countryId'],
                    properties: {
                        eventType: { bsonType: 'string' },
                        entityType: { bsonType: 'string' },
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
                },
            },
        });

        // Ledger Entries collection (append-only)
        await db.createCollection(COLLECTIONS.LEDGER_ENTRIES, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['transactionId', 'accountId', 'amount', 'currency', 'type', 'timestamp', 'description', 'locationId', 'businessUnitId'],
                    properties: {
                        transactionId: { bsonType: 'string' },
                        accountId: { bsonType: 'objectId' },
                        amount: { bsonType: 'number' },
                        currency: { bsonType: 'string', minLength: 3, maxLength: 3 },
                        type: { enum: ['debit', 'credit'] },
                        timestamp: { bsonType: 'date' },
                        description: { bsonType: 'string' },
                        metadata: { bsonType: 'object' },
                        locationId: { bsonType: 'objectId' },
                        businessUnitId: { bsonType: 'objectId' },
                    },
                },
            },
        });

        // Location Daily Stats collection (projection)
        await db.createCollection(COLLECTIONS.LOCATION_DAILY_STATS, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['locationId', 'date', 'totalBookings', 'totalRevenue', 'totalAttendance', 'averageOccupancy'],
                    properties: {
                        locationId: { bsonType: 'objectId' },
                        date: { bsonType: 'date' },
                        totalBookings: { bsonType: 'int', minimum: 0 },
                        totalRevenue: { bsonType: 'number', minimum: 0 },
                        totalAttendance: { bsonType: 'int', minimum: 0 },
                        averageOccupancy: { bsonType: 'number', minimum: 0, maximum: 100 },
                        programStats: { bsonType: 'array' },
                        lastUpdated: { bsonType: 'date' },
                    },
                },
            },
        });

        // User Activity Summary collection (projection)
        await db.createCollection(COLLECTIONS.USER_ACTIVITY_SUMMARY, {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['userId', 'month', 'totalBookings', 'totalSpent', 'attendanceRate'],
                    properties: {
                        userId: { bsonType: 'objectId' },
                        month: { bsonType: 'date' },
                        totalBookings: { bsonType: 'int', minimum: 0 },
                        totalSpent: { bsonType: 'number', minimum: 0 },
                        attendanceRate: { bsonType: 'number', minimum: 0, maximum: 100 },
                        favoritePrograms: { bsonType: 'array' },
                        lastUpdated: { bsonType: 'date' },
                    },
                },
            },
        });

        console.log('✅ Migration 001: Collections created successfully');
    },

    async down(db: Db): Promise<void> {
        // Drop all collections
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

        for (const collection of collections) {
            await db.dropCollection(collection);
        }

        console.log('✅ Migration 001: Collections dropped successfully');
    },
};