import { Request, Response } from 'express';
import { RoleService } from './role.service';

// Simple error handler
const handleError = (res: Response, error: any) => {
    console.error('Error:', error);
    const message = error.message || 'Internal server error';
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message,
    });
};

export class RoleController {
    /**
     * Create a new role
     * POST /api/v1/roles
     */
    static async create(req: Request, res: Response) {
        try {
            const {
                name,
                description,
                permissions,
                roleType,
                status,
                assignedLocations,
                assignedBusinessUnits,
            } = req.body;

            // Validate required fields
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Role name is required',
                });
            }

            const role = await RoleService.create({
                name,
                description,
                permissions: permissions || [],
                roleType: roleType || 'custom',
                status: status || 'active',
                assignedLocations: assignedLocations || [],
                assignedBusinessUnits: assignedBusinessUnits || [],
            });

            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: role,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get all roles
     * GET /api/v1/roles
     */
    static async getAll(req: Request, res: Response) {
        try {
            const { page, limit, search, status, roleType } = req.query;

            const result = await RoleService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                search: search as string,
                status: status as string,
                roleType: roleType as string,
            });

            res.status(200).json({
                success: true,
                message: 'Roles retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get role by ID
     * GET /api/v1/roles/:id
     */
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const role = await RoleService.getById(id);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Role retrieved successfully',
                data: role,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Update role
     * PUT /api/v1/roles/:id
     */
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const {
                description,
                permissions,
                roleType,
                status,
                assignedLocations,
                assignedBusinessUnits,
            } = req.body;

            const role = await RoleService.update(id, {
                description,
                permissions,
                roleType,
                status,
                assignedLocations,
                assignedBusinessUnits,
            });

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                data: role,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Delete role
     * DELETE /api/v1/roles/:id
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const success = await RoleService.delete(id);

            res.status(200).json({
                success,
                message: 'Role deleted successfully',
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get roles by type
     * GET /api/v1/roles/type/:roleType
     */
    static async getByType(req: Request, res: Response) {
        try {
            const { roleType } = req.params;

            const roles = await RoleService.getByType(roleType);

            res.status(200).json({
                success: true,
                message: 'Roles retrieved successfully',
                data: roles,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get active roles
     * GET /api/v1/roles/active
     */
    static async getActive(req: Request, res: Response) {
        try {
            const roles = await RoleService.getActive();

            res.status(200).json({
                success: true,
                message: 'Active roles retrieved successfully',
                data: roles,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Add permission to role
     * POST /api/v1/roles/:id/permissions
     */
    static async addPermission(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { permissionName } = req.body;

            if (!permissionName) {
                return res.status(400).json({
                    success: false,
                    message: 'Permission name is required',
                });
            }

            const role = await RoleService.addPermission(id, permissionName);

            res.status(200).json({
                success: true,
                message: 'Permission added to role successfully',
                data: role,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Remove permission from role
     * DELETE /api/v1/roles/:id/permissions/:permissionName
     */
    static async removePermission(req: Request, res: Response) {
        try {
            const { id, permissionName } = req.params;

            const role = await RoleService.removePermission(id, permissionName);

            res.status(200).json({
                success: true,
                message: 'Permission removed from role successfully',
                data: role,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get roles by location
     * GET /api/v1/roles/location/:locationId
     */
    static async getByLocation(req: Request, res: Response) {
        try {
            const { locationId } = req.params;

            const roles = await RoleService.getByLocation(locationId);

            res.status(200).json({
                success: true,
                message: 'Roles retrieved successfully',
                data: roles,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get roles by business unit
     * GET /api/v1/roles/business-unit/:businessUnitId
     */
    static async getByBusinessUnit(req: Request, res: Response) {
        try {
            const { businessUnitId } = req.params;

            const roles = await RoleService.getByBusinessUnit(businessUnitId);

            res.status(200).json({
                success: true,
                message: 'Roles retrieved successfully',
                data: roles,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Bulk update status
     * PATCH /api/v1/roles/bulk/status
     */
    static async bulkUpdateStatus(req: Request, res: Response) {
        try {
            const { ids, status } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs array is required',
                });
            }

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required',
                });
            }

            const result = await RoleService.bulkUpdateStatus(ids, status);

            res.status(200).json({
                success: true,
                message: 'Roles updated successfully',
                data: result,
            });
        } catch (error) {
            handleError(res, error);
        }
    }
}
