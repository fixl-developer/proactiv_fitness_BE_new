import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { UserRole } from '@shared/enums';
import envConfig from '@config/env.config';
import userService from './user.service';
import logger from '@shared/utils/logger.util';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
                tenantId?: string;
                organizationId?: string;
                locationId?: string;
            };
            scopeFilter?: Record<string, any>;
        }
    }
}

/**
 * Authenticate user using JWT token
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', HTTP_STATUS.UNAUTHORIZED);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded: any = jwt.verify(token, envConfig.get().jwtSecret);

        // Get user from database
        const user = await userService.getUserById(decoded.id);

        if (!user) {
            throw new AppError('User not found', HTTP_STATUS.UNAUTHORIZED);
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
            throw new AppError('User account is not active', HTTP_STATUS.FORBIDDEN);
        }

        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            organizationId: user.organizationId?.toString(),
            locationId: user.locationId?.toString(),
        };

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED));
        }
        next(error);
    }
};

/**
 * Authorize user based on roles
 */
export const authorize = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        // Normalize role comparison — handle case where DB role might differ in casing
        const userRole = (req.user.role as string)?.toUpperCase?.() || '';
        const allowedRoles = roles.map(r => r.toUpperCase());

        if (!allowedRoles.includes(userRole)) {
            logger.warn('Authorization failed', {
                userRole: req.user.role,
                normalizedRole: userRole,
                allowedRoles: roles,
                userId: req.user.id,
                path: req.originalUrl
            });
            return next(
                new AppError('You do not have permission to perform this action', HTTP_STATUS.FORBIDDEN)
            );
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded: any = jwt.verify(token, envConfig.get().jwtSecret);
            const user = await userService.getUserById(decoded.id);

            if (user && user.status === 'ACTIVE') {
                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                    organizationId: user.organizationId?.toString(),
                    locationId: user.locationId?.toString(),
                };
            }
        }

        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};

/**
 * Check if user owns the resource
 */
export const checkOwnership = (userIdParam: string = 'id') => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        const resourceUserId = req.params[userIdParam];

        // Admin can access any resource
        if (req.user.role === UserRole.ADMIN) {
            return next();
        }

        // Check if user owns the resource
        if (req.user.id !== resourceUserId) {
            return next(
                new AppError('You do not have permission to access this resource', HTTP_STATUS.FORBIDDEN)
            );
        }

        next();
    };
};

/**
 * Check tenant access
 */
export const checkTenantAccess = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
    }

    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

    // Admin can access all tenants
    if (req.user.role === UserRole.ADMIN) {
        return next();
    }

    // Check if user belongs to the tenant
    if (req.user.tenantId !== tenantId) {
        return next(
            new AppError('You do not have permission to access this tenant', HTTP_STATUS.FORBIDDEN)
        );
    }

    next();
};

/**
 * Rate limit for authentication endpoints
 */
export const authRateLimit = (_req: Request, _res: Response, next: NextFunction) => {
    // This is a placeholder - actual rate limiting is handled by express-rate-limit
    // You can add custom logic here if needed
    next();
};

/**
 * Scope-based filter middleware.
 * Attaches a scopeFilter to req based on the user's role:
 * - ADMIN: no filter (sees everything)
 * - REGIONAL_ADMIN: { organizationId: req.user.organizationId }
 * - FRANCHISE_OWNER: { organizationId: req.user.organizationId }
 * - LOCATION_MANAGER: { locationId: req.user.locationId }
 * - Others: { _id: req.user.id } (can only see themselves)
 */
export const scopeFilter = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        let filter: Record<string, any> = {};

        switch (req.user.role) {
            case UserRole.ADMIN:
                // No filter - sees everything
                filter = {};
                break;

            case UserRole.REGIONAL_ADMIN:
                // Sees only users in their organization/region
                if (req.user.organizationId) {
                    filter = { organizationId: req.user.organizationId };
                }
                break;

            case UserRole.FRANCHISE_OWNER:
                // Sees only users in their organization (franchise locations)
                if (req.user.organizationId) {
                    filter = { organizationId: req.user.organizationId };
                }
                break;

            case UserRole.LOCATION_MANAGER:
                // Sees only users in their location
                if (req.user.locationId) {
                    filter = { locationId: req.user.locationId };
                }
                break;

            default:
                // Other roles can only see themselves
                filter = { _id: req.user.id };
                break;
        }

        req.scopeFilter = filter;
        next();
    };
};

// Alias for backward compatibility
export const authMiddleware = authenticate;
