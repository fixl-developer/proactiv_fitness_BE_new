import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IPermission extends Document {
    name: string;
    description?: string;
    module: string;
    action: string;
    resourceType?: string;
    status: 'active' | 'inactive' | 'deprecated';
    isSystemPermission: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
    {
        // Basic Information
        name: {
            type: String,
            required: [true, 'Permission name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Permission name must be at least 2 characters'],
            maxlength: [100, 'Permission name cannot exceed 100 characters'],
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },

        // Permission Details
        module: {
            type: String,
            required: [true, 'Module is required'],
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
            index: true,
        },
        action: {
            type: String,
            required: [true, 'Action is required'],
            enum: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'],
            index: true,
        },

        // Priority 1 Fields
        resourceType: {
            type: String,
            enum: {
                values: [
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
                message: '{VALUE} is not a valid resource type',
            },
            required: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'deprecated'],
            default: 'active',
            index: true,
        },
        isSystemPermission: {
            type: Boolean,
            default: false,
            index: true,
        },

        // Base Fields
        ...baseSchemaFields,
    },
    baseSchemaOptions
);

// Indexes for performance
permissionSchema.index({ module: 1, action: 1 });
permissionSchema.index({ status: 1 });
permissionSchema.index({ isSystemPermission: 1 });
permissionSchema.index({ createdAt: -1 });

export const Permission = model<IPermission>('Permission', permissionSchema);
