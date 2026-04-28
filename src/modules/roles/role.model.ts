import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions } from '@shared/base/base.model';

export interface IRole extends Document {
    name: string;
    description?: string;
    permissions: string[];
    roleType?: 'admin' | 'manager' | 'staff' | 'user' | 'custom';
    status: 'active' | 'inactive' | 'deprecated';
    assignedLocations?: string[];
    assignedBusinessUnits?: string[];
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
    {
        // Basic Information
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Role name must be at least 2 characters'],
            maxlength: [100, 'Role name cannot exceed 100 characters'],
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },

        // Permissions
        permissions: [
            {
                type: String,
                ref: 'Permission',
            },
        ],

        // Priority 1 Fields
        roleType: {
            type: String,
            enum: ['admin', 'manager', 'staff', 'user', 'custom'],
            default: 'custom',
            index: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'deprecated'],
            default: 'active',
            index: true,
        },
        assignedLocations: [
            {
                type: String,
                ref: 'Location',
            },
        ],
        assignedBusinessUnits: [
            {
                type: String,
                ref: 'BusinessUnit',
            },
        ],

        // System Role Flag
        isSystem: {
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
roleSchema.index({ roleType: 1 });
roleSchema.index({ status: 1 });
roleSchema.index({ isSystem: 1 });
roleSchema.index({ createdAt: -1 });

export const Role = model<IRole>('Role', roleSchema);
