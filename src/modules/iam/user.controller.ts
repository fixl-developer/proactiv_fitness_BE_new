import { Request, Response } from 'express';
import { BaseController } from '@shared/base/base.controller';
import userService from './user.service';
import { IUserCreate, IUserUpdate, IUserQuery } from './user.interface';
import { UserStatus } from '@shared/enums';

export class UserController extends BaseController {
    /**
     * Create a new user (Admin only)
     * POST /api/v1/users
     */
    async create(req: Request, res: Response) {
        const data: IUserCreate = req.body;
        const user = await userService.createUser(data);
        return this.sendCreated(res, userService.formatUserResponse(user), 'User created successfully');
    }

    /**
     * Get all users
     * GET /api/v1/users
     */
    async getAll(req: Request, res: Response) {
        const query: IUserQuery = {
            role: req.query.role as any,
            status: req.query.status as any,
            tenantId: req.query.tenantId as string,
            organizationId: req.query.organizationId as string,
            locationId: req.query.locationId as string,
            search: req.query.search as string,
        };

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
     * Delete user (soft delete)
     * DELETE /api/v1/users/:id
     */
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const result = await userService.deleteUser(id);

        if (!result) {
            return this.sendNotFound(res, 'User not found');
        }

        return this.sendSuccess(res, null, 'User deleted successfully');
    }

    /**
     * Update user status
     * PATCH /api/v1/users/:id/status
     */
    async updateStatus(req: Request, res: Response) {
        const { id } = req.params;
        const { status } = req.body;

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
