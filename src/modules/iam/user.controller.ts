import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import userService from './user.service';
import { IUserCreate, IUserUpdate, IUserQuery } from './user.interface';
import { UserRole, UserStatus } from '@shared/enums';
import { ROLE_HIERARCHY, DELETE_HIERARCHY, STATUS_HIERARCHY } from './rbac.middleware';

export class UserController extends BaseController {
    /**
     * Create a new user (with RBAC hierarchy checks)
     * POST /api/v1/users
     */
    async create(req: Request, res: Response) {
        const data: IUserCreate = req.body;
        const requester = req.user!;

        // Verify the requester can create the requested role
        const allowedRoles = ROLE_HIERARCHY[requester.role] || [];
        if (!allowedRoles.includes(data.role)) {
            return this.sendForbidden(
                res,
                `Role '${requester.role}' cannot create users with role '${data.role}'`
            );
        }

        // Auto-assign scope fields based on the requester's role
        switch (requester.role) {
            case UserRole.REGIONAL_ADMIN:
                // Auto-assign the same organizationId (region)
                if (requester.organizationId) {
                    data.organizationId = requester.organizationId;
                }
                break;

            case UserRole.FRANCHISE_OWNER:
                // Auto-assign the same organizationId and locationId
                if (requester.organizationId) {
                    data.organizationId = requester.organizationId;
                }
                if (requester.locationId && !data.locationId) {
                    data.locationId = requester.locationId;
                }
                break;

            case UserRole.LOCATION_MANAGER:
                // Auto-assign the same organizationId and locationId
                if (requester.organizationId) {
                    data.organizationId = requester.organizationId;
                }
                if (requester.locationId) {
                    data.locationId = requester.locationId;
                }
                break;

            default:
                // ADMIN can set any scope fields manually via the request body
                break;
        }

        const user = await userService.createUser(data);
        return this.sendCreated(res, userService.formatUserResponse(user), 'User created successfully');
    }

    /**
     * Get all users (scoped by role)
     * GET /api/v1/users
     */
    async getAll(req: Request, res: Response) {
        const requester = req.user!;

        const query: IUserQuery = {
            role: req.query.role as any,
            status: req.query.status as any,
            tenantId: req.query.tenantId as string,
            organizationId: req.query.organizationId as string,
            locationId: req.query.locationId as string,
            search: req.query.search as string,
        };

        // Apply scope-based filtering
        switch (requester.role) {
            case UserRole.ADMIN:
                // ADMIN sees all users - no additional filter
                break;

            case UserRole.REGIONAL_ADMIN:
                // REGIONAL_ADMIN sees only users in their organization/region
                if (requester.organizationId) {
                    query.organizationId = requester.organizationId;
                }
                break;

            case UserRole.FRANCHISE_OWNER:
                // FRANCHISE_OWNER sees only users in their organization
                if (requester.organizationId) {
                    query.organizationId = requester.organizationId;
                }
                break;

            case UserRole.LOCATION_MANAGER:
                // LOCATION_MANAGER sees only users in their location
                if (requester.locationId) {
                    query.locationId = requester.locationId;
                }
                break;

            default:
                // Other roles shouldn't reach here due to route-level authorization,
                // but if they do, return empty
                return this.sendSuccess(res, []);
        }

        // Also apply scopeFilter from middleware if present
        if (req.scopeFilter) {
            if (req.scopeFilter.organizationId && !query.organizationId) {
                query.organizationId = req.scopeFilter.organizationId;
            }
            if (req.scopeFilter.locationId && !query.locationId) {
                query.locationId = req.scopeFilter.locationId;
            }
        }

        const users = await userService.getUsers(query);
        const formattedUsers = users.map((user) => userService.formatUserResponse(user));

        return this.sendSuccess(res, formattedUsers);
    }

    /**
     * Get user by ID
     * GET /api/v1/users/:id
     */
    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (!user) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, userService.formatUserResponse(user));
    }

    /**
     * Update user
     * PUT /api/v1/users/:id
     */
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data: IUserUpdate = req.body;

        const user = await userService.updateUser(id, data);

        if (!user) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, userService.formatUserResponse(user), 'User updated successfully');
    }

    /**
     * Delete user (soft delete) with RBAC hierarchy check
     * DELETE /api/v1/users/:id
     */
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const requester = req.user!;

        // Cannot delete yourself
        if (requester.id === id) {
            return this.sendForbidden(res, 'You cannot delete your own account');
        }

        // Verify requester can delete the target user
        const targetUser = await userService.getUserById(id);
        if (!targetUser) {
            return this.sendNotFound(res, 'User not found');
        }

        const allowedRoles = DELETE_HIERARCHY[requester.role] || [];
        if (!allowedRoles.includes(targetUser.role)) {
            return this.sendForbidden(
                res,
                `Role '${requester.role}' cannot delete users with role '${targetUser.role}'`
            );
        }

        const result = await userService.deleteUser(id);

        if (!result) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, null, 'User deleted successfully');
    }

    /**
     * Update user status with RBAC hierarchy check
     * PATCH /api/v1/users/:id/status
     */
    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;
        const requester = req.user!;

        // Cannot deactivate yourself
        if (requester.id === id) {
            return this.sendForbidden(res, 'You cannot change your own status');
        }

        // Verify requester can change the target user's status
        const targetUser = await userService.getUserById(id);
        if (!targetUser) {
            return this.sendNotFound(res, 'User not found');
        }

        const allowedRoles = STATUS_HIERARCHY[requester.role] || [];
        if (!allowedRoles.includes(targetUser.role)) {
            return this.sendForbidden(
                res,
                `Role '${requester.role}' cannot update status of users with role '${targetUser.role}'`
            );
        }

        const user = await userService.updateUserStatus(id, status as UserStatus);

        if (!user) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, userService.formatUserResponse(user), 'User status updated successfully');
    }

    /**
     * Get user profile (current user)
     * GET /api/v1/users/profile
     */
    async getProfile(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const user = await userService.getUserById(userId);

        if (!user) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, userService.formatUserResponse(user));
    }

    /**
     * Update user profile (current user)
     * PUT /api/v1/users/profile
     */
    async updateProfile(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const data: IUserUpdate = req.body;

        const user = await userService.updateUser(userId, data);

        if (!user) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, userService.formatUserResponse(user), 'Profile updated successfully');
    }
}

export default new UserController();
