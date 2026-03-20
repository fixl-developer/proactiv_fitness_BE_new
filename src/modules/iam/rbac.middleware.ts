import { Request, Response, NextFunction } from 'express';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { UserRole } from '@shared/enums';
import userService from './user.service';

// Role hierarchy map - each role can create roles listed in its array
const ROLE_HIERARCHY: Record<string, string[]> = {
    'ADMIN': ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'PARTNER_ADMIN', 'SUPPORT_STAFF'],
    'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'SUPPORT_STAFF'],
    'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH'],
    'LOCATION_MANAGER': ['COACH'],
    'COACH': [],
    'PARENT': [],
    'USER': [],
    'PARTNER_ADMIN': [],
    'SUPPORT_STAFF': [],
};

// Who can delete whom (more restrictive)
const DELETE_HIERARCHY: Record<string, string[]> = {
    'ADMIN': ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'PARTNER_ADMIN', 'SUPPORT_STAFF'],
    'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH'],
    'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH'],
    'LOCATION_MANAGER': ['COACH'],
};

// Who can update status of whom
const STATUS_HIERARCHY: Record<string, string[]> = { ...DELETE_HIERARCHY };

/**
 * Check if the authenticated user's role can create the requested role.
 * Reads the target role from req.body.role.
 */
export const canCreateRole = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        const requesterRole = req.user.role;
        const targetRole = req.body.role;

        if (!targetRole) {
            return next(new AppError('Target role is required', HTTP_STATUS.BAD_REQUEST));
        }

        const allowedRoles = ROLE_HIERARCHY[requesterRole] || [];

        if (!allowedRoles.includes(targetRole)) {
            return next(
                new AppError(
                    `Role '${requesterRole}' cannot create users with role '${targetRole}'`,
                    HTTP_STATUS.FORBIDDEN
                )
            );
        }

        next();
    };
};

/**
 * Check if the authenticated user can delete the target user.
 * Looks up the target user by req.params.id.
 */
export const canDeleteUser = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
            }

            const targetUserId = req.params.id;

            // ADMIN cannot delete themselves
            if (req.user.id === targetUserId) {
                return next(
                    new AppError('You cannot delete your own account', HTTP_STATUS.FORBIDDEN)
                );
            }

            const targetUser = await userService.getUserById(targetUserId);
            if (!targetUser) {
                return next(new AppError('Target user not found', HTTP_STATUS.NOT_FOUND));
            }

            const requesterRole = req.user.role;
            const allowedRoles = DELETE_HIERARCHY[requesterRole] || [];

            if (!allowedRoles.includes(targetUser.role)) {
                return next(
                    new AppError(
                        `Role '${requesterRole}' cannot delete users with role '${targetUser.role}'`,
                        HTTP_STATUS.FORBIDDEN
                    )
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Check if the authenticated user can change the target user's status.
 * Looks up the target user by req.params.id.
 */
export const canUpdateUserStatus = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
            }

            const targetUserId = req.params.id;

            // Cannot deactivate yourself
            if (req.user.id === targetUserId) {
                return next(
                    new AppError('You cannot change your own status', HTTP_STATUS.FORBIDDEN)
                );
            }

            const targetUser = await userService.getUserById(targetUserId);
            if (!targetUser) {
                return next(new AppError('Target user not found', HTTP_STATUS.NOT_FOUND));
            }

            const requesterRole = req.user.role;
            const allowedRoles = STATUS_HIERARCHY[requesterRole] || [];

            if (!allowedRoles.includes(targetUser.role)) {
                return next(
                    new AppError(
                        `Role '${requesterRole}' cannot update status of users with role '${targetUser.role}'`,
                        HTTP_STATUS.FORBIDDEN
                    )
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Returns a scope filter based on the user's role and attaches it to req.scopeFilter.
 * - ADMIN: no filter (sees everything)
 * - REGIONAL_ADMIN: filters by organizationId
 * - FRANCHISE_OWNER: filters by organizationId (all locations under their org)
 * - LOCATION_MANAGER: filters by locationId
 * - Others: filters by own user id only
 */
export const canViewUsers = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        let scopeFilter: Record<string, any> = {};

        switch (req.user.role) {
            case UserRole.ADMIN:
                // No filter - sees everything
                scopeFilter = {};
                break;

            case UserRole.REGIONAL_ADMIN:
                // Sees only users in their organization/region
                if (req.user.organizationId) {
                    scopeFilter = { organizationId: req.user.organizationId };
                }
                break;

            case UserRole.FRANCHISE_OWNER:
                // Sees only users in their organization (all franchise locations)
                if (req.user.organizationId) {
                    scopeFilter = { organizationId: req.user.organizationId };
                }
                break;

            case UserRole.LOCATION_MANAGER:
                // Sees only users in their location
                if (req.user.locationId) {
                    scopeFilter = { locationId: req.user.locationId };
                }
                break;

            default:
                // Other roles can only see themselves
                scopeFilter = { _id: req.user.id };
                break;
        }

        (req as any).scopeFilter = scopeFilter;
        next();
    };
};

export { ROLE_HIERARCHY, DELETE_HIERARCHY, STATUS_HIERARCHY };
