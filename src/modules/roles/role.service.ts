import { Role, IRole } from './role.model';
import { PermissionService } from '../permissions/permission.service';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class RoleService {
    /**
     * Create a new role
     */
    static async create(data: Partial<IRole>): Promise<IRole> {
        try {
            // Validate required fields
            if (!data.name) {
                throw new Error('Role name is required');
            }

            // Check if role already exists
            const existing = await Role.findOne({ name: data.name });
            if (existing) {
                throw new Error(`Role with name "${data.name}" already exists`);
            }

            // Validate permissions if provided
            if (data.permissions && data.permissions.length > 0) {
                const valid = await PermissionService.validatePermissions(data.permissions);
                if (!valid) {
                    throw new Error('One or more permissions do not exist');
                }
            }

            // Create role
            const role = new Role({
                name: data.name,
                description: data.description,
                permissions: data.permissions || [],
                roleType: data.roleType || 'custom',
                status: data.status || 'active',
                assignedLocations: data.assignedLocations || [],
                assignedBusinessUnits: data.assignedBusinessUnits || [],
                isSystem: data.isSystem || false,
            });

            return await role.save();
        } catch (error) {
            throw new Error(`Failed to create role: ${error.message}`);
        }
    }

    /**
     * Get all roles with filtering and pagination
     */
    static async getAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        roleType?: string;
    }): Promise<{ data: IRole[]; pagination: any }> {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;

            // Build filter
            const filter: FilterQuery<IRole> = {};

            if (query.search) {
                filter.$or = [
                    { name: { $regex: query.search, $options: 'i' } },
                    { description: { $regex: query.search, $options: 'i' } },
                ];
            }

            if (query.status) {
                filter.status = query.status;
            }

            if (query.roleType) {
                filter.roleType = query.roleType;
            }

            // Get total count
            const total = await Role.countDocuments(filter);

            // Get roles
            const roles = await Role.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return {
                data: roles,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw new Error(`Failed to get roles: ${error.message}`);
        }
    }

    /**
     * Get role by ID
     */
    static async getById(id: string): Promise<IRole | null> {
        try {
            return await Role.findById(id).lean();
        } catch (error) {
            throw new Error(`Failed to get role: ${error.message}`);
        }
    }

    /**
     * Get role by name
     */
    static async getByName(name: string): Promise<IRole | null> {
        try {
            return await Role.findOne({ name }).lean();
        } catch (error) {
            throw new Error(`Failed to get role by name: ${error.message}`);
        }
    }

    /**
     * Update role
     */
    static async update(id: string, data: Partial<IRole>): Promise<IRole | null> {
        try {
            // Get existing role
            const role = await Role.findById(id);
            if (!role) {
                throw new Error('Role not found');
            }

            // Prevent renaming system roles
            if (role.isSystem && data.name && data.name !== role.name) {
                throw new Error('System roles cannot be renamed');
            }

            // Validate permissions if provided
            if (data.permissions && data.permissions.length > 0) {
                const valid = await PermissionService.validatePermissions(data.permissions);
                if (!valid) {
                    throw new Error('One or more permissions do not exist');
                }
            }

            // Update role
            const update: UpdateQuery<IRole> = {};
            if (data.description !== undefined) update.description = data.description;
            if (data.permissions !== undefined) update.permissions = data.permissions;
            if (data.roleType !== undefined) update.roleType = data.roleType;
            if (data.status !== undefined) update.status = data.status;
            if (data.assignedLocations !== undefined) update.assignedLocations = data.assignedLocations;
            if (data.assignedBusinessUnits !== undefined) update.assignedBusinessUnits = data.assignedBusinessUnits;

            return await Role.findByIdAndUpdate(id, update, { new: true }).lean();
        } catch (error) {
            throw new Error(`Failed to update role: ${error.message}`);
        }
    }

    /**
     * Delete role
     */
    static async delete(id: string): Promise<boolean> {
        try {
            // Get role
            const role = await Role.findById(id);
            if (!role) {
                throw new Error('Role not found');
            }

            // Prevent deletion of system roles
            if (role.isSystem) {
                throw new Error('System roles cannot be deleted');
            }

            // Delete role
            await Role.findByIdAndDelete(id);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete role: ${error.message}`);
        }
    }

    /**
     * Get roles by type
     */
    static async getByType(roleType: string): Promise<IRole[]> {
        try {
            return await Role.find({ roleType, status: 'active' }).lean();
        } catch (error) {
            throw new Error(`Failed to get roles by type: ${error.message}`);
        }
    }

    /**
     * Get active roles
     */
    static async getActive(): Promise<IRole[]> {
        try {
            return await Role.find({ status: 'active' }).lean();
        } catch (error) {
            throw new Error(`Failed to get active roles: ${error.message}`);
        }
    }

    /**
     * Add permission to role
     */
    static async addPermission(roleId: string, permissionName: string): Promise<IRole | null> {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error('Role not found');
            }

            // Check if permission already exists
            if (role.permissions.includes(permissionName)) {
                throw new Error('Permission already assigned to this role');
            }

            // Validate permission exists
            const valid = await PermissionService.validatePermissions([permissionName]);
            if (!valid) {
                throw new Error('Permission does not exist');
            }

            // Add permission
            role.permissions.push(permissionName);
            return await role.save();
        } catch (error) {
            throw new Error(`Failed to add permission to role: ${error.message}`);
        }
    }

    /**
     * Remove permission from role
     */
    static async removePermission(roleId: string, permissionName: string): Promise<IRole | null> {
        try {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error('Role not found');
            }

            // Remove permission
            role.permissions = role.permissions.filter(p => p !== permissionName);
            return await role.save();
        } catch (error) {
            throw new Error(`Failed to remove permission from role: ${error.message}`);
        }
    }

    /**
     * Get roles by location
     */
    static async getByLocation(locationId: string): Promise<IRole[]> {
        try {
            return await Role.find({
                assignedLocations: locationId,
                status: 'active',
            }).lean();
        } catch (error) {
            throw new Error(`Failed to get roles by location: ${error.message}`);
        }
    }

    /**
     * Get roles by business unit
     */
    static async getByBusinessUnit(businessUnitId: string): Promise<IRole[]> {
        try {
            return await Role.find({
                assignedBusinessUnits: businessUnitId,
                status: 'active',
            }).lean();
        } catch (error) {
            throw new Error(`Failed to get roles by business unit: ${error.message}`);
        }
    }

    /**
     * Bulk update status
     */
    static async bulkUpdateStatus(ids: string[], status: string): Promise<any> {
        try {
            return await Role.updateMany(
                { _id: { $in: ids }, isSystem: false },
                { status }
            );
        } catch (error) {
            throw new Error(`Failed to bulk update roles: ${error.message}`);
        }
    }
}
