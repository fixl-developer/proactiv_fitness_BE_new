import { Permission, IPermission } from './permission.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class PermissionService {
    /**
     * Create a new permission
     */
    static async create(data: Partial<IPermission>): Promise<IPermission> {
        try {
            // Validate required fields
            if (!data.name || !data.module || !data.action) {
                throw new Error('Permission name, module, and action are required');
            }

            // Check if permission already exists
            const existing = await Permission.findOne({ name: data.name });
            if (existing) {
                throw new Error(`Permission with name "${data.name}" already exists`);
            }

            // Create permission. resourceType is optional and the schema enum
            // does not allow null, so omit the field when it isn't supplied.
            const permission = new Permission({
                name: data.name,
                description: data.description,
                module: data.module,
                action: data.action,
                ...(data.resourceType ? { resourceType: data.resourceType } : {}),
                status: data.status || 'active',
                isSystemPermission: data.isSystemPermission || false,
            });

            return await permission.save();
        } catch (error) {
            throw new Error(`Failed to create permission: ${error.message}`);
        }
    }

    /**
     * Get all permissions with filtering and pagination
     */
    static async getAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        module?: string;
        status?: string;
        resourceType?: string;
    }): Promise<{ data: IPermission[]; pagination: any }> {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;

            // Build filter
            const filter: FilterQuery<IPermission> = {};

            if (query.search) {
                filter.$or = [
                    { name: { $regex: query.search, $options: 'i' } },
                    { description: { $regex: query.search, $options: 'i' } },
                ];
            }

            if (query.module) {
                filter.module = query.module;
            }

            if (query.status) {
                filter.status = query.status;
            }

            if (query.resourceType) {
                filter.resourceType = query.resourceType;
            }

            // Get total count
            const total = await Permission.countDocuments(filter);

            // Get permissions
            const permissions = await Permission.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return {
                data: permissions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw new Error(`Failed to get permissions: ${error.message}`);
        }
    }

    /**
     * Get permission by ID
     */
    static async getById(id: string): Promise<IPermission | null> {
        try {
            return await Permission.findById(id).lean();
        } catch (error) {
            throw new Error(`Failed to get permission: ${error.message}`);
        }
    }

    /**
     * Get permissions by module
     */
    static async getByModule(module: string): Promise<IPermission[]> {
        try {
            return await Permission.find({ module, status: 'active' }).lean();
        } catch (error) {
            throw new Error(`Failed to get permissions by module: ${error.message}`);
        }
    }

    /**
     * Update permission
     */
    static async update(id: string, data: Partial<IPermission>): Promise<IPermission | null> {
        try {
            // Get existing permission
            const permission = await Permission.findById(id);
            if (!permission) {
                throw new Error('Permission not found');
            }

            // Prevent renaming system permissions
            if (permission.isSystemPermission && data.name && data.name !== permission.name) {
                throw new Error('System permissions cannot be renamed');
            }

            // Update permission
            const update: UpdateQuery<IPermission> = {};
            if (data.description !== undefined) update.description = data.description;
            if (data.resourceType !== undefined) update.resourceType = data.resourceType;
            if (data.status !== undefined) update.status = data.status;

            return await Permission.findByIdAndUpdate(id, update, { new: true }).lean();
        } catch (error) {
            throw new Error(`Failed to update permission: ${error.message}`);
        }
    }

    /**
     * Delete permission
     */
    static async delete(id: string): Promise<boolean> {
        try {
            // Get permission
            const permission = await Permission.findById(id);
            if (!permission) {
                throw new Error('Permission not found');
            }

            // Prevent deletion of system permissions
            if (permission.isSystemPermission) {
                throw new Error('System permissions cannot be deleted');
            }

            // Delete permission
            await Permission.findByIdAndDelete(id);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete permission: ${error.message}`);
        }
    }

    /**
     * Get permissions by names
     */
    static async getByNames(names: string[]): Promise<IPermission[]> {
        try {
            return await Permission.find({ name: { $in: names } }).lean();
        } catch (error) {
            throw new Error(`Failed to get permissions by names: ${error.message}`);
        }
    }

    /**
     * Validate permissions exist
     */
    static async validatePermissions(permissionNames: string[]): Promise<boolean> {
        try {
            const permissions = await Permission.find({ name: { $in: permissionNames } });
            return permissions.length === permissionNames.length;
        } catch (error) {
            throw new Error(`Failed to validate permissions: ${error.message}`);
        }
    }

    /**
     * Get active permissions
     */
    static async getActive(): Promise<IPermission[]> {
        try {
            return await Permission.find({ status: 'active' }).lean();
        } catch (error) {
            throw new Error(`Failed to get active permissions: ${error.message}`);
        }
    }

    /**
     * Bulk update status
     */
    static async bulkUpdateStatus(ids: string[], status: string): Promise<any> {
        try {
            return await Permission.updateMany(
                { _id: { $in: ids }, isSystemPermission: false },
                { status }
            );
        } catch (error) {
            throw new Error(`Failed to bulk update permissions: ${error.message}`);
        }
    }
}
