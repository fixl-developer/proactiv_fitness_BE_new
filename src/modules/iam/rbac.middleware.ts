import { Request, Response, NextFunction } from 'express';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { UserRole } from '@shared/enums';
import userService from './user.service';

// Role hierarchy map - each role can create roles listed in its array.
// PARENT / USER / STUDENT are self-register roles (created via /auth/register),
// so they are intentionally excluded from admin-creatable roles here.
const ROLE_HIERARCHY: Record<string, string[]> = {
    'ADMIN': [
        'ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER',
        'MANAGER', 'COACH', 'STAFF', 'SUPPORT_STAFF', 'PARTNER_ADMIN'
    ],
    'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'STAFF', 'SUPPORT_STAFF'],
    'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH', 'STAFF'],
    'LOCATION_MANAGER': ['COACH', 'STAFF'],
    'COACH': [],
    'PARENT': [],
    'USER': [],
    'PARTNER_ADMIN': [],
    'SUPPORT_STAFF': [],
};

// Who can delete whom — admin can also clean up self-registered PARENT/USER accounts.
const DELETE_HIERARCHY: Record<string, string[]> = {
    'ADMIN': [
        'ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER',
        'MANAGER', 'COACH', 'STAFF', 'SUPPORT_STAFF', 'PARTNER_ADMIN',
        'PARENT', 'STUDENT', 'USER'
    ],
    'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'STAFF', 'PARENT', 'STUDENT', 'USER'],
    'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH', 'STAFF', 'PARENT', 'STUDENT', 'USER'],
    'LOCATION_MANAGER': ['COACH', 'STAFF', 'PARENT', 'STUDENT', 'USER'],
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
                // Sees users in their region (via regionId) or organization
                if ((req.user as any).regionId) {
                    scopeFilter = { regionId: (req.user as any).regionId };
                } else if (req.user.organizationId) {
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

/**
 * Check if the authenticated user can update the target user.
 * If a role change is being attempted, validates against ROLE_HIERARCHY.
 * Prevents self-demotion (changing own role to a lower role).
 */
export const canUpdateUser = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
            }

            const targetUserId = req.params.id;
            const newRole = req.body.role;

            const targetUser = await userService.getUserById(targetUserId);
            if (!targetUser) {
                return next(new AppError('Target user not found', HTTP_STATUS.NOT_FOUND));
            }

            const requesterRole = req.user.role;

            // Self-demotion protection: cannot change own role
            if (req.user.id === targetUserId && newRole && newRole !== requesterRole) {
                return next(
                    new AppError('You cannot change your own role', HTTP_STATUS.FORBIDDEN)
                );
            }

            // If updating someone else, check hierarchy
            if (req.user.id !== targetUserId) {
                const allowedRoles = ROLE_HIERARCHY[requesterRole] || [];

                // Must be able to manage the target user's current role
                if (!allowedRoles.includes(targetUser.role)) {
                    return next(
                        new AppError(
                            `Role '${requesterRole}' cannot update users with role '${targetUser.role}'`,
                            HTTP_STATUS.FORBIDDEN
                        )
                    );
                }

                // If changing role, must also be able to assign the new role
                if (newRole && newRole !== targetUser.role && !allowedRoles.includes(newRole)) {
                    return next(
                        new AppError(
                            `Role '${requesterRole}' cannot assign role '${newRole}'`,
                            HTTP_STATUS.FORBIDDEN
                        )
                    );
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Validates that the requester can assign the target locationId based on their scope.
 * - ADMIN: can assign any location
 * - REGIONAL_ADMIN: can only assign locations in their region (organizationId)
 * - FRANCHISE_OWNER: can only assign locations in their organization (organizationId)
 * - LOCATION_MANAGER: can only assign their own location
 */
export const validateLocationScope = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
            }

            const requesterRole = req.user.role;
            const targetLocationId = req.body.locationId;

            // If no location is being assigned, skip validation
            if (!targetLocationId) {
                return next();
            }

            // ADMIN can assign any location
            if (requesterRole === UserRole.ADMIN) {
                return next();
            }

            // LOCATION_MANAGER: can only assign their own location
            if (requesterRole === UserRole.LOCATION_MANAGER) {
                if (req.user.locationId && req.user.locationId.toString() !== targetLocationId.toString()) {
                    return next(
                        new AppError(
                            'Location Managers can only create users for their own location',
                            HTTP_STATUS.FORBIDDEN
                        )
                    );
                }
                return next();
            }

            // REGIONAL_ADMIN & FRANCHISE_OWNER: validate location belongs to their organization
            if (requesterRole === UserRole.REGIONAL_ADMIN || requesterRole === UserRole.FRANCHISE_OWNER) {
                if (!req.user.organizationId) {
                    return next();
                }

                // Dynamically import Location model to avoid circular dependency
                const locationService = (require('../bcms/location.service') as any).default;
                const location = await locationService.getLocationById(targetLocationId);

                if (!location) {
                    return next(
                        new AppError('Target location not found', HTTP_STATUS.NOT_FOUND)
                    );
                }

                // Check if the location belongs to the requester's organization
                const locationOrgId = (location as any).organizationId || (location as any).businessUnitId;
                if (locationOrgId && locationOrgId.toString() !== req.user.organizationId.toString()) {
                    return next(
                        new AppError(
                            `You can only assign users to locations within your organization`,
                            HTTP_STATUS.FORBIDDEN
                        )
                    );
                }
                return next();
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export { ROLE_HIERARCHY, DELETE_HIERARCHY, STATUS_HIERARCHY };
