import { Request, Response } from 'express';
import { PermissionService } from './permission.service';

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

export class PermissionController {
    /**
     * Create a new permission
     * POST /api/v1/permissions
     */
    static async create(req: Request, res: Response) {
        try {
            const { name, description, module, action, resourceType, status, isSystemPermission } = req.body;

            // Validate required fields
            if (!name || !module || !action) {
                return res.status(400).json({
                    success: false,
                    message: 'Permission name, module, and action are required',
                });
            }

            const permission = await PermissionService.create({
                name,
                description,
                module,
                action,
                resourceType,
                status: status || 'active',
                isSystemPermission: isSystemPermission || false,
            });

            res.status(201).json({
                success: true,
                message: 'Permission created successfully',
                data: permission,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get all permissions
     * GET /api/v1/permissions
     */
    static async getAll(req: Request, res: Response) {
        try {
            const { page, limit, search, module, status, resourceType } = req.query;

            const result = await PermissionService.getAll({
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                search: search as string,
                module: module as string,
                status: status as string,
                resourceType: resourceType as string,
            });

            res.status(200).json({
                success: true,
                message: 'Permissions retrieved successfully',
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get permission by ID
     * GET /api/v1/permissions/:id
     */
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const permission = await PermissionService.getById(id);
            if (!permission) {
                return res.status(404).json({
                    success: false,
                    message: 'Permission not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Permission retrieved successfully',
                data: permission,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get permissions by module
     * GET /api/v1/permissions/module/:module
     */
    static async getByModule(req: Request, res: Response) {
        try {
            const { module } = req.params;

            const permissions = await PermissionService.getByModule(module);

            res.status(200).json({
                success: true,
                message: 'Permissions retrieved successfully',
                data: permissions,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Update permission
     * PUT /api/v1/permissions/:id
     */
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { description, resourceType, status } = req.body;

            const permission = await PermissionService.update(id, {
                description,
                resourceType,
                status,
            });

            if (!permission) {
                return res.status(404).json({
                    success: false,
                    message: 'Permission not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Permission updated successfully',
                data: permission,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Delete permission
     * DELETE /api/v1/permissions/:id
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const success = await PermissionService.delete(id);

            res.status(200).json({
                success,
                message: 'Permission deleted successfully',
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Get active permissions
     * GET /api/v1/permissions/active
     */
    static async getActive(req: Request, res: Response) {
        try {
            const permissions = await PermissionService.getActive();

            res.status(200).json({
                success: true,
                message: 'Active permissions retrieved successfully',
                data: permissions,
            });
        } catch (error) {
            handleError(res, error);
        }
    }

    /**
     * Bulk update status
     * PATCH /api/v1/permissions/bulk/status
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

            const result = await PermissionService.bulkUpdateStatus(ids, status);

            res.status(200).json({
                success: true,
                message: 'Permissions updated successfully',
                data: result,
            });
        } catch (error) {
            handleError(res, error);
        }
    }
}
