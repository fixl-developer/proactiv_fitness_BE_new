import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { UserRole } from '@shared/enums';
import envConfig from '@config/env.config';
import userService from './user.service';

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
        }
    }
}

/**
 * Authenticate user using JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
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
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        if (!roles.includes(req.user.role)) {
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
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
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
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
        }

        const resourceUserId = req.params[userIdParam];

        // Super admin and HQ admin can access any resource
        if (
            req.user.role === UserRole.SUPER_ADMIN ||
            req.user.role === UserRole.HQ_ADMIN
        ) {
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
export const checkTenantAccess = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
    }

    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

    // Super admin can access all tenants
    if (req.user.role === UserRole.SUPER_ADMIN) {
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
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
    // This is a placeholder - actual rate limiting is handled by express-rate-limit
    // You can add custom logic here if needed
    next();
};
