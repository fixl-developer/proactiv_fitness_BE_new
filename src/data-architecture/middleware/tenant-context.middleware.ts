import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { TenantContext } from '../interfaces';
import { AppError } from '../../shared/utils/app-error.util';
import logger from '../../shared/utils/logger.util';

/**
 * Extended Request interface with tenant context
 */
export interface RequestWithTenant extends Request {
    tenantContext?: TenantContext;
}

/**
 * Extract tenant context from JWT token or request headers
 * @param req Express request object
 * @returns TenantContext
 */
export function extractTenantContext(req: Request): TenantContext {
    const context: TenantContext = {};

    // Extract from authenticated user (JWT payload)
    const user = (req as any).user;

    if (user) {
        if (user.countryId) {
            context.countryId = new Types.ObjectId(user.countryId);
        }
        if (user.regionId) {
            context.regionId = new Types.ObjectId(user.regionId);
        }
        if (user.businessUnitId) {
            context.businessUnitId = new Types.ObjectId(user.businessUnitId);
        }
        if (user.locationId) {
            context.locationId = new Types.ObjectId(user.locationId);
        }
    }

    // Allow override from headers (for admin/system operations)
    const headerCountryId = req.headers['x-tenant-country-id'] as string;
    const headerRegionId = req.headers['x-tenant-region-id'] as string;
    const headerBusinessUnitId = req.headers['x-tenant-business-unit-id'] as string;
    const headerLocationId = req.headers['x-tenant-location-id'] as string;

    if (headerCountryId && Types.ObjectId.isValid(headerCountryId)) {
        context.countryId = new Types.ObjectId(headerCountryId);
    }
    if (headerRegionId && Types.ObjectId.isValid(headerRegionId)) {
        context.regionId = new Types.ObjectId(headerRegionId);
    }
    if (headerBusinessUnitId && Types.ObjectId.isValid(headerBusinessUnitId)) {
        context.businessUnitId = new Types.ObjectId(headerBusinessUnitId);
    }
    if (headerLocationId && Types.ObjectId.isValid(headerLocationId)) {
        context.locationId = new Types.ObjectId(headerLocationId);
    }

    return context;
}

/**
 * Apply tenant filter to MongoDB query
 * @param query MongoDB query object
 * @param context Tenant context
 * @returns Modified query with tenant filters
 */
export function applyTenantFilter(query: any, context: TenantContext): any {
    const tenantFilter: any = {};

    if (context.locationId) {
        // Most specific level - filter by location
        tenantFilter.locationId = context.locationId;
    } else if (context.businessUnitId) {
        // Filter by business unit
        tenantFilter.businessUnitId = context.businessUnitId;
    } else if (context.regionId) {
        // Filter by region
        tenantFilter.regionId = context.regionId;
    } else if (context.countryId) {
        // Filter by country
        tenantFilter.countryId = context.countryId;
    }

    // Merge with existing query
    return { ...query, ...tenantFilter };
}

/**
 * Validate tenant access for a user
 * @param context Tenant context
 * @param userId User ID
 * @returns boolean indicating if access is allowed
 */
export async function validateTenantAccess(
    context: TenantContext,
    userId: string
): Promise<boolean> {
    // TODO: Integrate with IAM module for permission checks
    // For now, basic validation that context is not empty

    if (!context.countryId) {
        return false;
    }

    // Additional validation logic can be added here
    // - Check if user has permission to access this tenant
    // - Verify hierarchical relationships
    // - Check role-based access control

    return true;
}

/**
 * Middleware to extract and attach tenant context to request
 */
export const tenantContextMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const context = extractTenantContext(req);

        // Attach to request
        (req as RequestWithTenant).tenantContext = context;

        // Log tenant context for debugging
        logger.debug('Tenant context extracted', {
            path: req.path,
            method: req.method,
            context,
        });

        next();
    } catch (error) {
        logger.error('Error extracting tenant context', { error });
        next(new AppError('Invalid tenant context', 400));
    }
};

/**
 * Middleware to require tenant context (fail if not present)
 */
export const requireTenantContext = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const context = (req as RequestWithTenant).tenantContext;

    if (!context || !context.countryId) {
        throw new AppError('Tenant context is required', 401);
    }

    next();
};

/**
 * Middleware to validate tenant access
 */
export const validateTenantAccessMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const context = (req as RequestWithTenant).tenantContext;
        const user = (req as any).user;

        if (!context) {
            throw new AppError('Tenant context not found', 401);
        }

        if (!user || !user.id) {
            throw new AppError('User not authenticated', 401);
        }

        const hasAccess = await validateTenantAccess(context, user.id);

        if (!hasAccess) {
            throw new AppError('Access denied to this tenant', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};
