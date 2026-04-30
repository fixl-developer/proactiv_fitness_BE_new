import { Db } from 'mongodb';

/**
 * Migration: Create Permissions and Roles Collections
 * This migration creates the permissions and roles collections with proper indexes
 */

export async function up(db: Db) {
    console.log('Running migration: Create Permissions and Roles Collections');

    try {
        // Create permissions collection
        await db.createCollection('permissions', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'module', 'action', 'status', 'isSystemPermission'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        name: {
                            bsonType: 'string',
                            description: 'Permission name (unique)',
                            minLength: 2,
                            maxLength: 100,
                        },
                        description: {
                            bsonType: 'string',
                            description: 'Permission description',
                            maxLength: 500,
                        },
                        module: {
                            bsonType: 'string',
                            description: 'Module name',
                            enum: [
                                'users',
                                'roles',
                                'permissions',
                                'cms',
                                'bookings',
                                'payments',
                                'reports',
                                'settings',
                                'locations',
                                'staff',
                                'students',
                                'parents',
                            ],
                        },
                        action: {
                            bsonType: 'string',
                            description: 'Action type',
                            enum: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'],
                        },
                        resourceType: {
                            bsonType: 'string',
                            description: 'Resource type',
                            enum: [
                                'User',
                                'Role',
                                'Permission',
                                'Booking',
                                'Payment',
                                'Report',
                                'Location',
                                'Staff',
                                'Student',
                                'Parent',
                                'Program',
                                'Schedule',
                                'Class',
                                'Session',
                            ],
                        },
                        status: {
                            bsonType: 'string',
                            description: 'Permission status',
                            enum: ['active', 'inactive', 'deprecated'],
                        },
                        isSystemPermission: {
                            bsonType: 'bool',
                            description: 'Whether this is a system permission',
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                    },
                },
            },
        });

        // Create indexes for permissions
        await db.collection('permissions').createIndex({ name: 1 }, { unique: true });
        await db.collection('permissions').createIndex({ module: 1, action: 1 });
        await db.collection('permissions').createIndex({ status: 1 });
        await db.collection('permissions').createIndex({ isSystemPermission: 1 });
        await db.collection('permissions').createIndex({ createdAt: -1 });

        console.log('✓ Permissions collection created with indexes');

        // Create roles collection
        await db.createCollection('roles', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'status', 'isSystem'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        name: {
                            bsonType: 'string',
                            description: 'Role name (unique)',
                            minLength: 2,
                            maxLength: 100,
                        },
                        description: {
                            bsonType: 'string',
                            description: 'Role description',
                            maxLength: 500,
                        },
                        permissions: {
                            bsonType: 'array',
                            description: 'Array of permission names',
                            items: { bsonType: 'string' },
                        },
                        roleType: {
                            bsonType: 'string',
                            description: 'Role type',
                            enum: ['admin', 'manager', 'staff', 'user', 'custom'],
                        },
                        status: {
                            bsonType: 'string',
                            description: 'Role status',
                            enum: ['active', 'inactive', 'deprecated'],
                        },
                        assignedLocations: {
                            bsonType: 'array',
                            description: 'Array of location IDs',
                            items: { bsonType: 'string' },
                        },
                        assignedBusinessUnits: {
                            bsonType: 'array',
                            description: 'Array of business unit IDs',
                            items: { bsonType: 'string' },
                        },
                        isSystem: {
                            bsonType: 'bool',
                            description: 'Whether this is a system role',
                        },
                        createdAt: { bsonType: 'date' },
                        updatedAt: { bsonType: 'date' },
                    },
                },
            },
        });

        // Create indexes for roles
        await db.collection('roles').createIndex({ name: 1 }, { unique: true });
        await db.collection('roles').createIndex({ roleType: 1 });
        await db.collection('roles').createIndex({ status: 1 });
        await db.collection('roles').createIndex({ isSystem: 1 });
        await db.collection('roles').createIndex({ createdAt: -1 });

        console.log('✓ Roles collection created with indexes');
    } catch (error) {
        console.error('✗ Migration failed:', error);
        throw error;
    }
}

export async function down(db: Db) {
    console.log('Rolling back migration: Create Permissions and Roles Collections');

    try {
        // Drop collections
        await db.collection('permissions').drop();
        await db.collection('roles').drop();

        console.log('✓ Permissions and Roles collections dropped');
    } catch (error) {
        console.error('✗ Rollback failed:', error);
        throw error;
    }
}
